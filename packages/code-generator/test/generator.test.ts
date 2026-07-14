import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { inspectCustomRecipe, type CustomRecipeDraft } from '@scrapestudio/extraction-core';
import { describe, expect, it } from 'vitest';

import { CodeGenerationError, generateStarterCode } from '../src/index.js';

const fixtureRecipe: CustomRecipeDraft = {
  itemSelector: '.workshop-card',
  fields: [
    { id: 'title', mode: 'text', name: 'title', selector: 'h2', trim: true },
    { id: 'url', mode: 'href', name: 'url', selector: 'a', trim: true },
    { id: 'links', mode: 'count', name: 'linkCount', selector: 'a' },
  ],
};

function assertJavaScriptSyntax(code: string) {
  const checked = spawnSync(process.execPath, ['--input-type=module', '--check'], {
    encoding: 'utf8',
    input: code,
  });
  expect(checked.status, checked.stderr).toBe(0);
}

function assertPythonSyntax(code: string) {
  const candidates = process.platform === 'win32' ? ['python', 'py'] : ['python3', 'python'];
  for (const candidate of candidates) {
    const args =
      candidate === 'py'
        ? ['-3', '-c', 'import sys; compile(sys.stdin.read(), "generated.py", "exec")']
        : ['-c', 'import sys; compile(sys.stdin.read(), "generated.py", "exec")'];
    const checked = spawnSync(candidate, args, { encoding: 'utf8', input: code });
    if (!checked.error) {
      expect(checked.status, checked.stderr).toBe(0);
      return;
    }
  }
  throw new Error('A Python interpreter is required to verify generated starter syntax.');
}

describe('template code generator', () => {
  it('generates syntactically sane Python and JavaScript from a fixture-backed recipe', () => {
    const html = readFileSync(join(process.cwd(), 'tests/fixtures/repeated-cards.html'), 'utf8');
    const inspection = inspectCustomRecipe(html, 'https://example.com/workshops', fixtureRecipe);
    expect(inspection.valid).toBe(true);
    expect(inspection.totalItemCount).toBe(6);

    const python = generateStarterCode({
      recipe: fixtureRecipe,
      target: 'python',
      targetUrl: 'https://example.com/workshops',
    });
    const javascript = generateStarterCode({
      recipe: fixtureRecipe,
      target: 'javascript',
      targetUrl: 'https://example.com/workshops',
    });

    assertPythonSyntax(python.code);
    assertJavaScriptSyntax(javascript.code);
    expect(python.code).toContain('BeautifulSoup');
    expect(javascript.code).toContain('import { parseHTML } from "linkedom"');
    expect(python.code).toContain('TIMEOUT_SECONDS = 10');
    expect(javascript.code).toContain('AbortSignal.timeout(TIMEOUT_MS)');
  });

  it('escapes hostile recipe strings without breaking either language', () => {
    const hostileRecipe: CustomRecipeDraft = {
      itemSelector: 'article[data-label="x\\ny"]',
      fields: [
        {
          fallback: '"; process.exit(1); # <script>',
          id: 'hostile',
          mode: 'attribute',
          name: 'line\n"quoted"',
          selector: '[data-value="a\\\\b"]',
          attribute: 'data-"value',
          trim: false,
        },
      ],
    };
    const python = generateStarterCode({
      recipe: hostileRecipe,
      target: 'python',
      targetUrl: 'https://example.com/page',
    });
    const javascript = generateStarterCode({
      recipe: hostileRecipe,
      target: 'javascript',
      targetUrl: 'https://example.com/page',
    });

    assertPythonSyntax(python.code);
    assertJavaScriptSyntax(javascript.code);
    expect(javascript.code).not.toContain('<script>');
  });

  it('redacts likely secret query values and never emits credentialed URLs', () => {
    const output = generateStarterCode({
      recipe: fixtureRecipe,
      target: 'javascript',
      targetUrl: 'https://example.com/items?category=books&api_token=top-secret#results',
    });

    expect(output.redactedQueryParameters).toEqual(['api_token']);
    expect(output.code).toContain('category=books');
    expect(output.code).toContain('REPLACE_WITH_VALUE');
    expect(output.code).not.toContain('top-secret');
    expect(output.code).not.toContain('#results');
    expect(output.code).not.toContain('credentials: "include"');
    expect(output.code).not.toContain('"authorization":');

    expect(() =>
      generateStarterCode({
        recipe: fixtureRecipe,
        target: 'python',
        targetUrl: 'https://user:password@example.com/items',
      }),
    ).toThrowError(CodeGenerationError);
  });

  it('rejects unsupported and incomplete generation inputs', () => {
    expect(() =>
      generateStarterCode({
        recipe: fixtureRecipe,
        target: 'python',
        targetUrl: 'file:///tmp/page.html',
      }),
    ).toThrowError(expect.objectContaining({ code: 'unsupported_protocol' }));
    expect(() =>
      generateStarterCode({
        recipe: { fields: [], itemSelector: '' },
        target: 'javascript',
        targetUrl: 'https://example.com',
      }),
    ).toThrowError(expect.objectContaining({ code: 'empty_recipe' }));
  });
});
