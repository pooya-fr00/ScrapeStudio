import { describe, expect, it } from 'vitest';

import { createExportFilename, protectCsvCell, serializeCsv, serializeJson } from './export-data';

describe('export data', () => {
  it('serializes JSON with readable indentation and stable object keys', () => {
    expect(serializeJson({ z: 1, nested: { b: true, a: 'فارسی' }, a: 2 })).toBe(
      '{\n  "a": 2,\n  "nested": {\n    "a": "فارسی",\n    "b": true\n  },\n  "z": 1\n}',
    );
  });

  it.each(['=SUM(A1:A2)', '+cmd', '-2+3', '@IMPORTXML()', '  =1+1', '\t@cmd'])(
    'mitigates CSV formula injection for %s',
    (value) => {
      expect(protectCsvCell(value)).toBe(`'${value}`);
    },
  );

  it('preserves Persian text and escapes quotes and newlines in UTF-8 CSV', () => {
    const csv = serializeCsv([{ name: 'کتاب "راه"', note: 'خط اول\nخط دوم', value: '=1+1' }]);

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"کتاب ""راه"""');
    expect(csv).toContain('"خط اول\nخط دوم"');
    expect(csv).toContain('"\'=1+1"');
    expect(csv).toContain('\r\n');
  });

  it('creates a sanitized deterministic filename', () => {
    expect(
      createExportFilename(
        'https://Shop.Example.com/products?q=private',
        'Product Cards',
        'json',
        new Date('2026-07-14T12:00:00.000Z'),
      ),
    ).toBe('scrapestudio-shop-example-com-product-cards-2026-07-14.json');
  });
});
