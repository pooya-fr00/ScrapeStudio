import { PUBLIC_EXTRACTION_LIMITS } from '@scrapestudio/shared';

import { boundedLimit } from './limits.js';
import { parseDetachedPage, type DetachedParser } from './parse.js';
import { normalizeText } from './text.js';
import type { DetachedPage } from './types.js';
import { resolveHttpUrl } from './url.js';

export const CUSTOM_EXTRACTION_MODES = [
  'text',
  'innerText',
  'attribute',
  'href',
  'src',
  'html',
  'exists',
  'count',
] as const;

export type CustomExtractionMode = (typeof CUSTOM_EXTRACTION_MODES)[number];

export interface CustomFieldDefinition {
  attribute?: string;
  fallback?: string;
  id: string;
  mode: CustomExtractionMode;
  multiple?: boolean;
  name: string;
  selector: string;
  trim?: boolean;
}

export interface CustomRecipeDraft {
  fields: CustomFieldDefinition[];
  itemSelector: string;
}

export type CustomScalarValue = boolean | null | number | string;
export type CustomValue = CustomScalarValue | string[];
export type CustomResultRow = Record<string, CustomValue>;

export type CustomValidationCode =
  | 'attribute_required'
  | 'duplicate_name'
  | 'invalid_selector'
  | 'name_required'
  | 'selector_required'
  | 'too_many_fields';

export interface CustomValidationIssue {
  code: CustomValidationCode;
  fieldId?: string;
  scope: 'field' | 'item';
}

export interface CustomFieldInspection {
  fieldId: string;
  matchCount: number;
  valid: boolean;
}

export interface CustomRecipeInspection {
  fields: CustomFieldInspection[];
  issues: CustomValidationIssue[];
  itemCount: number;
  itemTruncated: boolean;
  totalItemCount: number;
  valid: boolean;
}

export interface CustomExtractionResult extends CustomRecipeInspection {
  columns: string[];
  rows: CustomResultRow[];
  valuesTruncated: boolean;
}

export interface CustomExtractionOptions {
  fieldLimit?: number;
  itemLimit?: number;
  parser?: DetachedParser;
  valuesPerFieldLimit?: number;
}

interface ResolvedCustomLimits {
  fields: number;
  items: number;
  valuesPerField: number;
}

const UNSAFE_HTML_ELEMENTS = new Set([
  'BASE',
  'EMBED',
  'FORM',
  'IFRAME',
  'LINK',
  'META',
  'NOSCRIPT',
  'OBJECT',
  'SCRIPT',
  'STYLE',
  'TEMPLATE',
]);

const SAFE_HTML_ATTRIBUTES = new Set(['alt', 'class', 'id', 'role', 'title']);

function resolveCustomLimits(options: CustomExtractionOptions): ResolvedCustomLimits {
  return {
    fields: boundedLimit(options.fieldLimit, PUBLIC_EXTRACTION_LIMITS.customFields),
    items: boundedLimit(options.itemLimit, PUBLIC_EXTRACTION_LIMITS.customItemMatches),
    valuesPerField: boundedLimit(
      options.valuesPerFieldLimit,
      PUBLIC_EXTRACTION_LIMITS.customValuesPerField,
    ),
  };
}

function selectorIsValid(scope: ParentNode, selector: string): boolean {
  try {
    scope.querySelector(selector);
    return true;
  } catch {
    return false;
  }
}

function queryFieldNodes(item: Element, selector: string): Element[] {
  if (selector === ':scope') {
    return [item];
  }
  return Array.from(item.querySelectorAll(selector));
}

function validateRecipe(
  page: DetachedPage,
  recipe: CustomRecipeDraft,
  limits: ResolvedCustomLimits,
): {
  fields: CustomFieldDefinition[];
  issues: CustomValidationIssue[];
  itemSelectorValid: boolean;
} {
  const issues: CustomValidationIssue[] = [];
  const itemSelector = recipe.itemSelector.trim();
  const itemSelectorValid = itemSelector.length > 0 && selectorIsValid(page.document, itemSelector);

  if (!itemSelector) {
    issues.push({ code: 'selector_required', scope: 'item' });
  } else if (!itemSelectorValid) {
    issues.push({ code: 'invalid_selector', scope: 'item' });
  }

  if (recipe.fields.length > limits.fields) {
    issues.push({ code: 'too_many_fields', scope: 'field' });
  }

  const fields = recipe.fields.slice(0, limits.fields);
  const names = new Set<string>();
  for (const field of fields) {
    const name = field.name.trim();
    const normalizedName = name.toLocaleLowerCase('en-US');
    if (!name) {
      issues.push({ code: 'name_required', fieldId: field.id, scope: 'field' });
    } else if (names.has(normalizedName)) {
      issues.push({ code: 'duplicate_name', fieldId: field.id, scope: 'field' });
    } else {
      names.add(normalizedName);
    }

    const selector = field.selector.trim();
    if (!selector) {
      issues.push({ code: 'selector_required', fieldId: field.id, scope: 'field' });
    } else if (!selectorIsValid(page.document, selector)) {
      issues.push({ code: 'invalid_selector', fieldId: field.id, scope: 'field' });
    }

    if (field.mode === 'attribute' && !field.attribute?.trim()) {
      issues.push({ code: 'attribute_required', fieldId: field.id, scope: 'field' });
    }
  }

  return { fields, issues, itemSelectorValid };
}

function inspectParsedRecipe(
  page: DetachedPage,
  recipe: CustomRecipeDraft,
  limits: ResolvedCustomLimits,
): CustomRecipeInspection & { items: Element[] } {
  const validation = validateRecipe(page, recipe, limits);
  const allItems = validation.itemSelectorValid
    ? Array.from(page.document.querySelectorAll(recipe.itemSelector.trim()))
    : [];
  const items = allItems.slice(0, limits.items);
  const fields = validation.fields.map((field) => {
    const invalid = validation.issues.some((issue) => issue.fieldId === field.id);
    let matchCount = 0;
    if (!invalid) {
      for (const item of items) {
        matchCount += queryFieldNodes(item, field.selector.trim()).length;
      }
    }
    return { fieldId: field.id, matchCount, valid: !invalid };
  });

  return {
    fields,
    issues: validation.issues,
    itemCount: items.length,
    items,
    itemTruncated: allItems.length > items.length,
    totalItemCount: allItems.length,
    valid: validation.issues.length === 0 && validation.fields.length > 0,
  };
}

function sanitizedInnerHtml(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  if (UNSAFE_HTML_ELEMENTS.has(clone.tagName)) {
    return '';
  }
  for (const candidate of [clone, ...Array.from(clone.querySelectorAll('*'))]) {
    if (UNSAFE_HTML_ELEMENTS.has(candidate.tagName)) {
      candidate.remove();
      continue;
    }
    for (const attribute of Array.from(candidate.attributes)) {
      const name = attribute.name.toLowerCase();
      if (!SAFE_HTML_ATTRIBUTES.has(name) && !name.startsWith('aria-')) {
        candidate.removeAttribute(attribute.name);
      }
    }
  }
  return clone.innerHTML;
}

function applyStringOptions(value: string | null, field: CustomFieldDefinition): string | null {
  if (value === null) {
    return field.fallback ?? null;
  }
  const processed = field.trim === false ? value : value.trim();
  return processed || field.fallback || processed;
}

function extractStringValue(
  node: Element,
  field: CustomFieldDefinition,
  page: DetachedPage,
): string | null {
  switch (field.mode) {
    case 'attribute':
      return applyStringOptions(node.getAttribute(field.attribute?.trim() ?? ''), field);
    case 'href':
      return applyStringOptions(
        resolveHttpUrl(node.getAttribute('href'), page.baseUrl)?.href ?? null,
        field,
      );
    case 'html':
      return applyStringOptions(sanitizedInnerHtml(node), field);
    case 'innerText': {
      const value = 'innerText' in node ? (node as HTMLElement).innerText : node.textContent;
      return applyStringOptions(value ?? null, field);
    }
    case 'src':
      return applyStringOptions(
        resolveHttpUrl(node.getAttribute('src'), page.baseUrl)?.href ?? null,
        field,
      );
    case 'text':
      return applyStringOptions(normalizeText(node.textContent), field);
    case 'count':
    case 'exists':
      return null;
  }
}

function extractFieldValue(
  item: Element,
  field: CustomFieldDefinition,
  page: DetachedPage,
  valuesPerFieldLimit: number,
): { truncated: boolean; value: CustomValue } {
  const nodes = queryFieldNodes(item, field.selector.trim());
  if (field.mode === 'count') {
    return { truncated: false, value: nodes.length };
  }
  if (field.mode === 'exists') {
    return { truncated: false, value: nodes.length > 0 };
  }
  if (field.multiple) {
    return {
      truncated: nodes.length > valuesPerFieldLimit,
      value: nodes
        .slice(0, valuesPerFieldLimit)
        .map((node) => extractStringValue(node, field, page))
        .filter((value): value is string => value !== null && value.length > 0),
    };
  }
  const node = nodes[0];
  return {
    truncated: false,
    value: node ? extractStringValue(node, field, page) : (field.fallback ?? null),
  };
}

export function inspectCustomRecipe(
  html: string,
  finalUrl: string,
  recipe: CustomRecipeDraft,
  options: CustomExtractionOptions = {},
): CustomRecipeInspection {
  const limits = resolveCustomLimits(options);
  const page = parseDetachedPage(html, finalUrl, options.parser);
  const inspection = inspectParsedRecipe(page, recipe, limits);
  return {
    fields: inspection.fields,
    issues: inspection.issues,
    itemCount: inspection.itemCount,
    itemTruncated: inspection.itemTruncated,
    totalItemCount: inspection.totalItemCount,
    valid: inspection.valid,
  };
}

export function extractCustomRecipe(
  html: string,
  finalUrl: string,
  recipe: CustomRecipeDraft,
  options: CustomExtractionOptions = {},
): CustomExtractionResult {
  const limits = resolveCustomLimits(options);
  const page = parseDetachedPage(html, finalUrl, options.parser);
  const { items, ...inspection } = inspectParsedRecipe(page, recipe, limits);
  const validFields = recipe.fields.slice(0, limits.fields).filter((field) => {
    return !inspection.issues.some((issue) => issue.fieldId === field.id);
  });
  const columns = validFields.map((field) => field.name.trim());
  let valuesTruncated = false;
  const rows = items.map((item) => {
    const row: CustomResultRow = {};
    for (const field of validFields) {
      const extracted = extractFieldValue(item, field, page, limits.valuesPerField);
      row[field.name.trim()] = extracted.value;
      valuesTruncated ||= extracted.truncated;
    }
    return row;
  });

  return { ...inspection, columns, rows, valuesTruncated };
}
