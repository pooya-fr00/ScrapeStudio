import { describe, expect, it } from 'vitest';

import { extractTable, extractTables, parseDetachedPage } from '../src/index';
import { parseFixture } from './fixture';

describe('table extraction', () => {
  it('extracts captions, stable columns, and normalized rowspan/colspan cells', () => {
    const result = extractTables(parseFixture('table').document);
    const harvest = result.items[0];

    expect(result).toMatchObject({ returnedCount: 2, totalCount: 2, truncated: false });
    expect(harvest).toMatchObject({
      columnCount: 4,
      columns: ['Plot', 'Weight / Vegetables', 'Weight / Fruit', 'Plot (2)'],
      index: 0,
      returnedRowCount: 3,
      rowCount: 3,
      title: 'July harvest',
      truncated: false,
    });
    expect(harvest?.rows).toEqual([
      {
        Plot: 'A1',
        'Plot (2)': 'North',
        'Weight / Fruit': '3 kg',
        'Weight / Vegetables': '14 kg',
      },
      {
        Plot: 'B2',
        'Plot (2)': 'East',
        'Weight / Fruit': '5 kg',
        'Weight / Vegetables': '9 kg',
      },
      {
        Plot: 'B2',
        'Plot (2)': 'South',
        'Weight / Fruit': '12 kg combined',
        'Weight / Vegetables': '12 kg combined',
      },
    ]);
  });

  it('generates deterministic fallback column names for headerless tables', () => {
    const shifts = extractTables(parseFixture('table').document).items[1];

    expect(shifts).toMatchObject({
      columns: ['Column 1', 'Column 2'],
      rowCount: 2,
      title: 'Volunteer shifts',
    });
    expect(shifts?.rows[0]).toEqual({ 'Column 1': 'Morning', 'Column 2': 'Leila' });
  });

  it('caps rows and columns without losing the detected counts', () => {
    const document = parseDetachedPage(
      `<table><tr><th>A</th><th>B</th><th>C</th></tr>
       <tr><td>1</td><td>2</td><td>3</td></tr>
       <tr><td>4</td><td>5</td><td>6</td></tr></table>`,
      'https://example.com',
    ).document;
    const table = document.querySelector('table');
    expect(table).not.toBeNull();
    const result = extractTable(table as HTMLTableElement, 0, {
      columnLimit: 2,
      rowLimit: 1,
    });

    expect(result).toMatchObject({
      columnCount: 3,
      columns: ['A', 'B'],
      returnedRowCount: 1,
      rowCount: 2,
      truncated: true,
    });
  });

  it('shares the row budget across all detected tables', () => {
    const document = parseDetachedPage(
      `<table><tr><td>A1</td></tr><tr><td>A2</td></tr></table>
       <table><tr><td>B1</td></tr><tr><td>B2</td></tr></table>`,
      'https://example.com',
    ).document;
    const result = extractTables(document, { rowLimit: 3 });

    expect(result.items.map((table) => table.returnedRowCount)).toEqual([2, 1]);
    expect(result.items[1]).toMatchObject({ rowCount: 2, truncated: true });
  });

  it('excludes nested tables from top-level detection and parent rows', () => {
    const document = parseDetachedPage(
      '<table id="outer"><tr><td>Outer<table id="inner"><tr><td>Inner</td></tr></table></td></tr></table>',
      'https://example.com',
    ).document;
    const result = extractTables(document);

    expect(result.totalCount).toBe(1);
    expect(result.items[0]?.rows).toEqual([{ 'Column 1': 'Outer' }]);
  });
});
