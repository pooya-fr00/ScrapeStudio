import { boundedLimit, resolveExtractionLimits } from './limits.js';
import { normalizeText } from './text.js';
import type { ExtractedTable, ExtractionCollection } from './types.js';

const MAX_CELL_SPAN = 100;

interface ParsedGrid {
  detectedColumnCount: number;
  grid: string[][];
  headerRows: Set<number>;
}

function boundedSpan(value: number): number {
  return Number.isSafeInteger(value) && value > 0 ? Math.min(value, MAX_CELL_SPAN) : 1;
}

function tableRows(table: HTMLTableElement): HTMLTableRowElement[] {
  return [...table.rows].filter((row) => row.closest('table') === table);
}

function cellText(cell: HTMLTableCellElement, table: HTMLTableElement): string {
  const walker = cell.ownerDocument.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
  const parts: string[] = [];
  let node = walker.nextNode();

  while (node) {
    const parent = node.parentElement;
    if (parent?.closest('table') === table && !parent.closest('noscript,script,style,template')) {
      const text = normalizeText(node.nodeValue);
      if (text) {
        parts.push(text);
      }
    }
    node = walker.nextNode();
  }

  return normalizeText(parts.join(' '));
}

function buildGrid(table: HTMLTableElement, maximumColumns: number): ParsedGrid {
  const rows = tableRows(table);
  const grid: string[][] = [];
  const headerRows = new Set<number>();
  let detectedColumnCount = 0;
  const hasThead = rows.some((row) => row.parentElement?.tagName === 'THEAD');

  rows.forEach((row, rowIndex) => {
    const cells = [...row.cells].filter((cell) => cell.closest('table') === table);
    if (
      row.parentElement?.tagName === 'THEAD' ||
      (!hasThead && rowIndex === 0 && cells.some((cell) => cell.tagName === 'TH'))
    ) {
      headerRows.add(rowIndex);
    }

    const outputRow = (grid[rowIndex] ??= []);
    let columnIndex = 0;
    for (const cell of cells) {
      while (outputRow[columnIndex] !== undefined) {
        columnIndex += 1;
      }

      const columnSpan = boundedSpan(cell.colSpan);
      const rowSpan = boundedSpan(cell.rowSpan);
      detectedColumnCount = Math.max(detectedColumnCount, columnIndex + columnSpan);
      const text = cellText(cell, table);

      for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
        const targetRowIndex = rowIndex + rowOffset;
        const targetRow = (grid[targetRowIndex] ??= []);
        for (let columnOffset = 0; columnOffset < columnSpan; columnOffset += 1) {
          const targetColumn = columnIndex + columnOffset;
          if (targetColumn < maximumColumns && targetRow[targetColumn] === undefined) {
            targetRow[targetColumn] = text;
          }
        }
      }

      columnIndex += columnSpan;
    }
  });

  return { detectedColumnCount, grid, headerRows };
}

function stableColumns(grid: ParsedGrid, returnedColumnCount: number): string[] {
  const counts = new Map<string, number>();

  return Array.from({ length: returnedColumnCount }, (_, columnIndex) => {
    const parts = [...grid.headerRows]
      .map((rowIndex) => normalizeText(grid.grid[rowIndex]?.[columnIndex]))
      .filter((value, index, values) => value && values.indexOf(value) === index);
    const base = parts.join(' / ') || `Column ${columnIndex + 1}`;
    const count = (counts.get(base) ?? 0) + 1;
    counts.set(base, count);
    return count === 1 ? base : `${base} (${count})`;
  });
}

function tableTitle(table: HTMLTableElement): string | null {
  return (
    normalizeText(table.caption?.textContent) ||
    normalizeText(table.getAttribute('aria-label')) ||
    normalizeText(table.getAttribute('title')) ||
    null
  );
}

export function extractTable(
  table: HTMLTableElement,
  index: number,
  options: { columnLimit?: number; rowLimit?: number } = {},
): ExtractedTable {
  const limits = resolveExtractionLimits();
  const columnLimit = boundedLimit(options.columnLimit, limits.tableColumns);
  const rowLimit = boundedLimit(options.rowLimit, limits.tableRows);
  const parsed = buildGrid(table, columnLimit);
  const returnedColumnCount = Math.min(parsed.detectedColumnCount, columnLimit);
  const columns = stableColumns(parsed, returnedColumnCount);
  const dataRows = tableRows(table)
    .map((_row, rowIndex) => rowIndex)
    .filter((rowIndex) => !parsed.headerRows.has(rowIndex));
  const rows = dataRows.slice(0, rowLimit).map((rowIndex) => {
    const row: Record<string, string> = {};
    columns.forEach((column, columnIndex) => {
      row[column] = parsed.grid[rowIndex]?.[columnIndex] ?? '';
    });
    return row;
  });

  return {
    columnCount: parsed.detectedColumnCount,
    columns,
    index,
    returnedRowCount: rows.length,
    rowCount: dataRows.length,
    rows,
    title: tableTitle(table),
    truncated: rows.length < dataRows.length || returnedColumnCount < parsed.detectedColumnCount,
  };
}

export function extractTables(
  document: Document,
  options: { columnLimit?: number; rowLimit?: number; tableLimit?: number } = {},
): ExtractionCollection<ExtractedTable> {
  const limits = resolveExtractionLimits();
  const tableLimit = boundedLimit(options.tableLimit, limits.tables);
  const tables = [...document.querySelectorAll<HTMLTableElement>('table')].filter(
    (table) => !table.parentElement?.closest('table'),
  );
  let remainingRows = boundedLimit(options.rowLimit, limits.tableRows);
  const items = tables.slice(0, tableLimit).map((table, index) => {
    const extracted = extractTable(table, index, {
      ...(options.columnLimit === undefined ? {} : { columnLimit: options.columnLimit }),
      rowLimit: remainingRows,
    });
    remainingRows -= extracted.returnedRowCount;
    return extracted;
  });

  return {
    items,
    returnedCount: items.length,
    totalCount: tables.length,
    truncated: items.length < tables.length,
  };
}
