import { describe, expect, it } from 'vitest';

import { extractCustomRecipe, inspectCustomRecipe, type CustomRecipeDraft } from '../src/index';
import { loadFixture } from './fixture';

const workshopRecipe: CustomRecipeDraft = {
  fields: [
    { id: 'title', mode: 'text', name: 'title', selector: 'h2' },
    { id: 'url', mode: 'href', name: 'url', selector: 'a' },
  ],
  itemSelector: '.workshop-card',
};

describe('custom selector extraction', () => {
  it('inspects and extracts a bounded multi-field recipe', () => {
    const html = loadFixture('repeated-cards');
    const inspection = inspectCustomRecipe(
      html,
      'https://example.com/community/index.html',
      workshopRecipe,
    );

    expect(inspection).toMatchObject({
      itemCount: 6,
      itemTruncated: false,
      totalItemCount: 6,
      valid: true,
    });
    expect(inspection.fields).toEqual([
      { fieldId: 'title', matchCount: 6, valid: true },
      { fieldId: 'url', matchCount: 6, valid: true },
    ]);

    const result = extractCustomRecipe(
      html,
      'https://example.com/community/index.html',
      workshopRecipe,
    );
    expect(result.columns).toEqual(['title', 'url']);
    expect(result.rows).toHaveLength(6);
    expect(result.rows[0]).toEqual({
      title: 'Book repair',
      url: 'https://example.com/workshops/1',
    });
  });

  it('supports all safe public extraction modes and field options', () => {
    const html = `<!doctype html><base href="https://example.com/catalog/">
      <article class="card">
        <h2 data-code=" A-1 ">  Field   notes  </h2>
        <a href="../item/1">Details</a><a href="mailto:test@example.com">Email</a>
        <img src="images/one.jpg" alt="One"><span class="tag">New</span><span class="tag">Local</span>
        <div class="content" onclick="bad()"><script>bad()</script><b title="safe">Useful</b></div>
      </article>`;
    const recipe: CustomRecipeDraft = {
      itemSelector: '.card',
      fields: [
        { id: 'text', mode: 'text', name: 'text', selector: 'h2' },
        { id: 'inner', mode: 'innerText', name: 'inner', selector: 'h2' },
        {
          attribute: 'data-code',
          id: 'attribute',
          mode: 'attribute',
          name: 'code',
          selector: 'h2',
        },
        { id: 'href', mode: 'href', name: 'url', selector: 'a' },
        { id: 'src', mode: 'src', name: 'image', selector: 'img' },
        { id: 'html', mode: 'html', name: 'safeHtml', selector: '.content' },
        { id: 'exists', mode: 'exists', name: 'hasBadge', selector: '.badge' },
        { id: 'count', mode: 'count', name: 'tagCount', selector: '.tag' },
        {
          fallback: 'Unknown',
          id: 'fallback',
          mode: 'text',
          name: 'missing',
          selector: '.missing',
        },
        { id: 'multiple', mode: 'text', multiple: true, name: 'tags', selector: '.tag' },
      ],
    };

    const result = extractCustomRecipe(html, 'https://example.com/source', recipe);
    expect(result.rows[0]).toMatchObject({
      code: 'A-1',
      hasBadge: false,
      image: 'https://example.com/catalog/images/one.jpg',
      missing: 'Unknown',
      tagCount: 2,
      tags: ['New', 'Local'],
      text: 'Field notes',
      url: 'https://example.com/item/1',
    });
    expect(result.rows[0]?.safeHtml).toContain('<b title="safe">Useful</b>');
    expect(result.rows[0]?.safeHtml).not.toContain('script');
    expect(result.rows[0]?.safeHtml).not.toContain('onclick');
  });

  it('reports invalid selectors and fields without throwing', () => {
    const recipe: CustomRecipeDraft = {
      itemSelector: '.workshop-card',
      fields: [
        { id: 'valid', mode: 'text', name: 'title', selector: 'h2' },
        { id: 'invalid', mode: 'text', name: 'broken', selector: 'a[' },
        { id: 'attribute', mode: 'attribute', name: 'code', selector: 'h2' },
        { id: 'duplicate', mode: 'text', name: 'TITLE', selector: 'h2' },
      ],
    };

    expect(() =>
      extractCustomRecipe(loadFixture('repeated-cards'), 'https://example.com', recipe),
    ).not.toThrow();
    const result = extractCustomRecipe(
      loadFixture('repeated-cards'),
      'https://example.com',
      recipe,
    );
    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        { code: 'invalid_selector', fieldId: 'invalid', scope: 'field' },
        { code: 'attribute_required', fieldId: 'attribute', scope: 'field' },
        { code: 'duplicate_name', fieldId: 'duplicate', scope: 'field' },
      ]),
    );
    expect(result.columns).toEqual(['title']);
    expect(result.rows[0]).toEqual({ title: 'Book repair' });
  });

  it('reports invalid and missing item selectors with human-readable issue codes', () => {
    const html = loadFixture('repeated-cards');
    expect(
      inspectCustomRecipe(html, 'https://example.com', { ...workshopRecipe, itemSelector: '' }),
    ).toMatchObject({
      itemCount: 0,
      issues: [{ code: 'selector_required', scope: 'item' }],
      valid: false,
    });
    expect(
      inspectCustomRecipe(html, 'https://example.com', {
        ...workshopRecipe,
        itemSelector: '.card[',
      }),
    ).toMatchObject({
      itemCount: 0,
      issues: [{ code: 'invalid_selector', scope: 'item' }],
      valid: false,
    });
  });

  it('enforces item, field, and multiple-value limits', () => {
    const html = `<main>${Array.from(
      { length: 5 },
      (_, index) => `<article><i>${index}-a</i><i>${index}-b</i><i>${index}-c</i></article>`,
    ).join('')}</main>`;
    const fields = Array.from({ length: 4 }, (_, index) => ({
      id: `field-${index}`,
      mode: 'text' as const,
      multiple: true,
      name: `field${index}`,
      selector: 'i',
    }));
    const result = extractCustomRecipe(
      html,
      'https://example.com',
      { fields, itemSelector: 'article' },
      { fieldLimit: 2, itemLimit: 2, valuesPerFieldLimit: 2 },
    );

    expect(result).toMatchObject({ itemCount: 2, itemTruncated: true, totalItemCount: 5 });
    expect(result.issues).toContainEqual({ code: 'too_many_fields', scope: 'field' });
    expect(result.columns).toEqual(['field0', 'field1']);
    expect(result.rows[0]?.field0).toEqual(['0-a', '0-b']);
    expect(result.valuesTruncated).toBe(true);
  });
});
