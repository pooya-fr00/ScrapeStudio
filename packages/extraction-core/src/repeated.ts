import { SMART_DETECTION_LIMITS } from '@scrapestudio/shared';

import type { CustomExtractionMode, CustomRecipeDraft } from './custom.js';
import { boundedLimit } from './limits.js';
import { parseDetachedPage, type DetachedParser } from './parse.js';

export const REPEATED_STRUCTURE_REASONS = [
  'repeated_siblings',
  'shared_class',
  'similar_shape',
  'meaningful_text',
  'links',
  'images',
] as const;

export type RepeatedStructureReason = (typeof REPEATED_STRUCTURE_REASONS)[number];

export interface RepeatedStructureField {
  mode: Extract<CustomExtractionMode, 'href' | 'src' | 'text'>;
  name: 'image' | 'price' | 'text' | 'title' | 'url';
  selector: string;
}

export interface RepeatedStructureCandidate {
  confidence: number;
  itemCount: number;
  reasons: RepeatedStructureReason[];
  selector: string;
  suggestedFields: RepeatedStructureField[];
}

export interface RepeatedStructureNodeSnapshot {
  childIds: number[];
  classTokens: string[];
  directTextLength: number;
  excludedContext: boolean;
  id: number;
  idToken?: string;
  parentId: number | null;
  tag: string;
}

export interface RepeatedStructureSnapshot {
  nodes: RepeatedStructureNodeSnapshot[];
  truncated: boolean;
}

export interface RepeatedStructureLimits {
  candidates?: number;
  childrenPerNode?: number;
  depth?: number;
  minimumItems?: number;
  nodes?: number;
  suggestedFields?: number;
}

export interface RepeatedStructureAnalysis {
  candidates: RepeatedStructureCandidate[];
  inspectedNodes: number;
  snapshotTruncated: boolean;
}

const IGNORED_ELEMENTS = new Set([
  'BASE',
  'BR',
  'CANVAS',
  'EMBED',
  'HEAD',
  'IFRAME',
  'LINK',
  'META',
  'NOSCRIPT',
  'OBJECT',
  'PATH',
  'SCRIPT',
  'STYLE',
  'SVG',
  'TEMPLATE',
]);
const EXCLUDED_CONTEXTS = new Set(['FOOTER', 'HEADER', 'NAV']);
const EXCLUDED_ITEM_TAGS = new Set([
  'BUTTON',
  'OPTION',
  'SCRIPT',
  'SELECT',
  'STYLE',
  'TD',
  'TH',
  'TR',
]);
const HEADING_TAG = /^H[1-6]$/u;
const SAFE_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_-]{0,63}$/u;
const CARD_CLASS = /(?:^|-)(?:card|entry|item|listing|product|result|tile)(?:-|$)/iu;
const PRICE_CLASS = /(?:^|-)(?:amount|cost|price)(?:-|$)/iu;
const TITLE_CLASS = /(?:^|-)(?:label|name|title)(?:-|$)/iu;

interface ResolvedLimits {
  candidates: number;
  childrenPerNode: number;
  depth: number;
  minimumItems: number;
  nodes: number;
  suggestedFields: number;
}

interface NodeMetrics {
  hasImage: boolean;
  hasLink: boolean;
  subtreeNodes: number;
  textLength: number;
}

function resolveLimits(limits: RepeatedStructureLimits = {}): ResolvedLimits {
  return {
    candidates: boundedLimit(limits.candidates, SMART_DETECTION_LIMITS.candidates),
    childrenPerNode: boundedLimit(limits.childrenPerNode, SMART_DETECTION_LIMITS.childrenPerNode),
    depth: boundedLimit(limits.depth, SMART_DETECTION_LIMITS.depth),
    minimumItems:
      limits.minimumItems === undefined
        ? SMART_DETECTION_LIMITS.minimumItems
        : Math.max(SMART_DETECTION_LIMITS.minimumItems, boundedLimit(limits.minimumItems, 20)),
    nodes: boundedLimit(limits.nodes, SMART_DETECTION_LIMITS.nodes),
    suggestedFields: boundedLimit(limits.suggestedFields, SMART_DETECTION_LIMITS.suggestedFields),
  };
}

function safeToken(value: string | null): string | undefined {
  const token = value?.trim();
  return token && SAFE_IDENTIFIER.test(token) ? token : undefined;
}

function classTokens(element: Element): string[] {
  const tokens: string[] = [];
  for (const token of element.classList) {
    if (SAFE_IDENTIFIER.test(token) && !tokens.includes(token)) {
      tokens.push(token);
      if (tokens.length === 6) break;
    }
  }
  return tokens;
}

function directTextLength(element: Element): number {
  let length = 0;
  const childNodes = element.childNodes;
  for (let index = 0; index < childNodes.length && length < 240; index += 1) {
    const child = childNodes[index];
    if (child?.nodeType === 3) length += child.textContent?.trim().length ?? 0;
  }
  return Math.min(length, 240);
}

export function buildRepeatedStructureSnapshot(
  html: string,
  finalUrl: string,
  limits: RepeatedStructureLimits = {},
  parser?: DetachedParser,
): RepeatedStructureSnapshot {
  const resolved = resolveLimits(limits);
  const page = parseDetachedPage(html, finalUrl, parser);
  const root = page.document.body ?? page.document.documentElement;
  const nodes: RepeatedStructureNodeSnapshot[] = [];
  let truncated = false;
  const stack: Array<{
    depth: number;
    element: Element;
    excludedContext: boolean;
    parentId: number | null;
  }> = [{ depth: 0, element: root, excludedContext: false, parentId: null }];

  while (stack.length > 0 && nodes.length < resolved.nodes) {
    const current = stack.pop();
    if (!current || IGNORED_ELEMENTS.has(current.element.tagName)) continue;

    const id = nodes.length;
    const excludedContext =
      current.excludedContext || EXCLUDED_CONTEXTS.has(current.element.tagName);
    const idToken = safeToken(current.element.getAttribute('id'));
    const node: RepeatedStructureNodeSnapshot = {
      childIds: [],
      classTokens: classTokens(current.element),
      directTextLength: directTextLength(current.element),
      excludedContext,
      id,
      ...(idToken ? { idToken } : {}),
      parentId: current.parentId,
      tag: current.element.tagName.toLowerCase(),
    };
    nodes.push(node);
    if (current.parentId !== null) nodes[current.parentId]?.childIds.push(id);

    if (current.depth >= resolved.depth) {
      if (current.element.children.length > 0) truncated = true;
      continue;
    }

    const childElements: Element[] = [];
    for (
      let index = 0;
      index < current.element.children.length && index < resolved.childrenPerNode;
      index += 1
    ) {
      const child = current.element.children.item(index);
      if (child && !IGNORED_ELEMENTS.has(child.tagName)) childElements.push(child);
    }
    if (current.element.children.length > resolved.childrenPerNode) truncated = true;
    for (let index = childElements.length - 1; index >= 0; index -= 1) {
      const element = childElements[index];
      if (element) {
        stack.push({
          depth: current.depth + 1,
          element,
          excludedContext,
          parentId: id,
        });
      }
    }
  }

  if (stack.length > 0) truncated = true;
  return { nodes, truncated };
}

function shapeSignature(nodeId: number, nodes: RepeatedStructureNodeSnapshot[], depth = 0): string {
  const node = nodes[nodeId];
  if (!node) return '';
  if (depth >= 3 || node.childIds.length === 0) return node.tag;
  const children = node.childIds
    .slice(0, 10)
    .map((childId) => shapeSignature(childId, nodes, depth + 1));
  return `${node.tag}(${children.join(',')})`;
}

function metricsFor(
  nodeId: number,
  nodes: RepeatedStructureNodeSnapshot[],
  cache: Map<number, NodeMetrics>,
): NodeMetrics {
  const cached = cache.get(nodeId);
  if (cached) return cached;
  const node = nodes[nodeId];
  if (!node) return { hasImage: false, hasLink: false, subtreeNodes: 0, textLength: 0 };
  const metrics: NodeMetrics = {
    hasImage: node.tag === 'img',
    hasLink: node.tag === 'a',
    subtreeNodes: 1,
    textLength: node.directTextLength,
  };
  for (const childId of node.childIds) {
    const child = metricsFor(childId, nodes, cache);
    metrics.hasImage ||= child.hasImage;
    metrics.hasLink ||= child.hasLink;
    metrics.subtreeNodes += child.subtreeNodes;
    metrics.textLength += child.textLength;
  }
  metrics.textLength = Math.min(metrics.textLength, 2_000);
  cache.set(nodeId, metrics);
  return metrics;
}

function sharedClasses(items: RepeatedStructureNodeSnapshot[]): string[] {
  const first = items[0];
  if (!first) return [];
  return first.classTokens.filter((token) =>
    items.slice(1).every((item) => item.classTokens.includes(token)),
  );
}

function preferredClass(tokens: string[]): string | undefined {
  return tokens.find((token) => CARD_CLASS.test(token)) ?? tokens[0];
}

function selectorFor(
  parent: RepeatedStructureNodeSnapshot,
  items: RepeatedStructureNodeSnapshot[],
  shared: string[],
): string {
  const first = items[0];
  if (!first) return '*';
  const itemClass = preferredClass(shared);
  if (itemClass) return `${first.tag}.${itemClass}`;
  const parentSelector = parent.idToken
    ? `#${parent.idToken}`
    : parent.classTokens[0]
      ? `${parent.tag}.${parent.classTokens[0]}`
      : parent.tag;
  return `${parentSelector} > ${first.tag}`;
}

function descendants(
  nodeId: number,
  nodes: RepeatedStructureNodeSnapshot[],
): RepeatedStructureNodeSnapshot[] {
  const result: RepeatedStructureNodeSnapshot[] = [];
  const queue = [...(nodes[nodeId]?.childIds ?? [])];
  while (queue.length > 0 && result.length < 80) {
    const currentId = queue.shift();
    const current = currentId === undefined ? undefined : nodes[currentId];
    if (!current) continue;
    result.push(current);
    queue.push(...current.childIds.slice(0, 12));
  }
  return result;
}

function commonDescendant(
  itemIds: number[],
  nodes: RepeatedStructureNodeSnapshot[],
  predicate: (node: RepeatedStructureNodeSnapshot) => boolean,
): RepeatedStructureNodeSnapshot | undefined {
  const matches = itemIds.map((itemId) => descendants(itemId, nodes).find(predicate));
  if (matches.some((match) => !match)) return undefined;
  const first = matches[0];
  if (!first || !matches.every((match) => match?.tag === first.tag)) return undefined;
  return first;
}

function descendantSelector(node: RepeatedStructureNodeSnapshot): string {
  const semanticClass = node.classTokens.find(
    (token) => PRICE_CLASS.test(token) || TITLE_CLASS.test(token),
  );
  return semanticClass ? `.${semanticClass}` : node.tag;
}

function suggestedFields(
  itemIds: number[],
  nodes: RepeatedStructureNodeSnapshot[],
  limit: number,
): RepeatedStructureField[] {
  const fields: RepeatedStructureField[] = [];
  const add = (field: RepeatedStructureField | undefined) => {
    if (field && fields.length < limit && !fields.some((entry) => entry.name === field.name)) {
      fields.push(field);
    }
  };
  const heading = commonDescendant(itemIds, nodes, (node) =>
    HEADING_TAG.test(node.tag.toUpperCase()),
  );
  const named = commonDescendant(itemIds, nodes, (node) =>
    node.classTokens.some((token) => TITLE_CLASS.test(token)),
  );
  const price = commonDescendant(itemIds, nodes, (node) =>
    node.classTokens.some((token) => PRICE_CLASS.test(token)),
  );
  const link = commonDescendant(itemIds, nodes, (node) => node.tag === 'a');
  const image = commonDescendant(itemIds, nodes, (node) => node.tag === 'img');

  add(
    heading || named
      ? { mode: 'text', name: 'title', selector: descendantSelector(heading ?? named!) }
      : undefined,
  );
  add(price ? { mode: 'text', name: 'price', selector: descendantSelector(price) } : undefined);
  add(link ? { mode: 'href', name: 'url', selector: descendantSelector(link) } : undefined);
  add(image ? { mode: 'src', name: 'image', selector: descendantSelector(image) } : undefined);
  if (fields.length === 0) add({ mode: 'text', name: 'text', selector: ':scope' });
  return fields;
}

function candidateScore(
  items: RepeatedStructureNodeSnapshot[],
  shared: string[],
  metrics: NodeMetrics[],
): { reasons: RepeatedStructureReason[]; score: number } {
  const count = items.length;
  const meaningfulRatio = metrics.filter((metric) => metric.textLength >= 12).length / count;
  const linkRatio = metrics.filter((metric) => metric.hasLink).length / count;
  const imageRatio = metrics.filter((metric) => metric.hasImage).length / count;
  const averageNodes = metrics.reduce((sum, metric) => sum + metric.subtreeNodes, 0) / count;
  const averageText = metrics.reduce((sum, metric) => sum + metric.textLength, 0) / count;
  const first = items[0];
  let score = 35 + Math.min(count, 10) * 2;
  const reasons: RepeatedStructureReason[] = ['repeated_siblings', 'similar_shape'];
  if (shared.length > 0) {
    score += 18;
    reasons.push('shared_class');
  }
  if (meaningfulRatio >= 0.8) {
    score += 15;
    reasons.push('meaningful_text');
  }
  if (linkRatio >= 0.8) {
    score += 6;
    reasons.push('links');
  }
  if (imageRatio >= 0.8) {
    score += 5;
    reasons.push('images');
  }
  if (first?.tag === 'article') score += 5;
  if (averageNodes >= 3) score += 4;
  if (items.some((item) => item.excludedContext)) score -= 35;
  if (averageText < 8 && linkRatio < 0.8 && imageRatio < 0.8) score -= 25;
  return { reasons, score: Math.max(0, Math.min(97, Math.round(score))) };
}

export function analyzeRepeatedStructures(
  snapshot: RepeatedStructureSnapshot,
  limits: RepeatedStructureLimits = {},
): RepeatedStructureAnalysis {
  const resolved = resolveLimits(limits);
  const candidates: RepeatedStructureCandidate[] = [];
  const metricsCache = new Map<number, NodeMetrics>();

  for (const parent of snapshot.nodes) {
    const groups = new Map<string, number[]>();
    for (const childId of parent.childIds) {
      const child = snapshot.nodes[childId];
      if (!child || EXCLUDED_ITEM_TAGS.has(child.tag.toUpperCase())) continue;
      const signature = shapeSignature(childId, snapshot.nodes);
      const group = groups.get(signature) ?? [];
      group.push(childId);
      groups.set(signature, group);
    }

    for (const itemIds of groups.values()) {
      if (itemIds.length < resolved.minimumItems) continue;
      const items = itemIds
        .map((itemId) => snapshot.nodes[itemId])
        .filter((item): item is RepeatedStructureNodeSnapshot => item !== undefined);
      const shared = sharedClasses(items);
      const metrics = itemIds.map((itemId) => metricsFor(itemId, snapshot.nodes, metricsCache));
      const scored = candidateScore(items, shared, metrics);
      if (scored.score < 58) continue;
      candidates.push({
        confidence: scored.score,
        itemCount: items.length,
        reasons: scored.reasons,
        selector: selectorFor(parent, items, shared),
        suggestedFields: suggestedFields(itemIds, snapshot.nodes, resolved.suggestedFields),
      });
    }
  }

  const unique = new Map<string, RepeatedStructureCandidate>();
  for (const candidate of candidates) {
    const current = unique.get(candidate.selector);
    if (!current || candidate.confidence > current.confidence) {
      unique.set(candidate.selector, candidate);
    }
  }
  return {
    candidates: [...unique.values()]
      .sort((left, right) => right.confidence - left.confidence || right.itemCount - left.itemCount)
      .slice(0, resolved.candidates),
    inspectedNodes: snapshot.nodes.length,
    snapshotTruncated: snapshot.truncated,
  };
}

export function candidateToRecipe(candidate: RepeatedStructureCandidate): CustomRecipeDraft {
  return {
    fields: candidate.suggestedFields.map((field, index) => ({
      id: `smart-${field.name}-${index + 1}`,
      mode: field.mode,
      name: field.name,
      selector: field.selector,
      trim: true,
    })),
    itemSelector: candidate.selector,
  };
}
