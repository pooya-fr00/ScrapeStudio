import type { CustomResultRow, PageAnalysis } from '@scrapestudio/extraction-core';

import type { ResultCategory } from '../scrape/categories';

export type ExportRow = Record<string, unknown>;

export interface ExportPayload {
  data: unknown;
  kind: string;
  rows: ExportRow[];
}

const DANGEROUS_FORMULA_PREFIX = /^[\t\r ]*[=+\-@]/;

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right, 'en'))
        .map(([key, child]) => [key, stableValue(child)]),
    );
  }
  return value;
}

export function serializeJson(value: unknown, readable = true): string {
  return JSON.stringify(stableValue(value), null, readable ? 2 : undefined);
}

function serializeCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return serializeJson(value, false);
  }
  return String(value);
}

export function protectCsvCell(value: string): string {
  return DANGEROUS_FORMULA_PREFIX.test(value) ? `'${value}` : value;
}

function quoteCsvCell(value: unknown): string {
  const protectedValue = protectCsvCell(serializeCell(value));
  return `"${protectedValue.replaceAll('"', '""')}"`;
}

export function serializeCsv(rows: ExportRow[]): string {
  const columns: string[] = [];
  const known = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!known.has(key)) {
        known.add(key);
        columns.push(key);
      }
    }
  }
  if (columns.length === 0) {
    return '\uFEFF';
  }

  const lines = [
    columns.map(quoteCsvCell).join(','),
    ...rows.map((row) => columns.map((column) => quoteCsvCell(row[column])).join(',')),
  ];
  return `\uFEFF${lines.join('\r\n')}`;
}

function metadataRows(metadata: PageAnalysis['metadata']): ExportRow[] {
  return [
    {
      canonicalUrl: metadata.canonicalUrl,
      description: metadata.description,
      documentLanguage: metadata.documentLanguage,
      favicons: metadata.favicons,
      h1Count: metadata.h1Count,
      jsonLd: metadata.jsonLd.items,
      openGraph: metadata.openGraph,
      robots: metadata.robots,
      statistics: metadata.statistics,
      title: metadata.title,
      twitter: metadata.twitter,
      viewport: metadata.viewport,
    },
  ];
}

export function quickExportPayload(
  analysis: PageAnalysis,
  category: ResultCategory,
  tableIndex = 0,
): ExportPayload {
  switch (category) {
    case 'headings':
      return {
        data: analysis.headings,
        kind: category,
        rows: analysis.headings.items.map((item) => ({ ...item })),
      };
    case 'images':
      return {
        data: analysis.images,
        kind: category,
        rows: analysis.images.items.map((item) => ({ ...item })),
      };
    case 'links':
      return {
        data: analysis.links,
        kind: category,
        rows: analysis.links.items.map((item) => ({ ...item })),
      };
    case 'metadata':
      return { data: analysis.metadata, kind: category, rows: metadataRows(analysis.metadata) };
    case 'tables': {
      const selectedTable = analysis.tables.items[tableIndex] ?? analysis.tables.items[0];
      return {
        data: selectedTable ?? analysis.tables,
        kind: selectedTable ? `table-${selectedTable.index + 1}` : category,
        rows: selectedTable?.rows ?? [],
      };
    }
  }
}

export function customExportPayload(rows: CustomResultRow[]): ExportPayload {
  return { data: rows, kind: 'custom', rows };
}

function safeSegment(value: string): string {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function createExportFilename(
  sourceUrl: string,
  kind: string,
  extension: 'csv' | 'json',
  now = new Date(),
): string {
  let host = 'page';
  try {
    host = new URL(sourceUrl).hostname;
  } catch {
    // A sanitized fallback keeps export available for local/demo result envelopes.
  }
  const date = now.toISOString().slice(0, 10);
  return `scrapestudio-${safeSegment(host) || 'page'}-${safeSegment(kind) || 'data'}-${date}.${extension}`;
}
