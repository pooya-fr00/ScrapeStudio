import { SMART_DETECTION_LIMITS } from '@scrapestudio/shared';
import { describe, expect, it } from 'vitest';

import {
  analyzeRepeatedStructures,
  buildRepeatedStructureSnapshot,
  candidateToRecipe,
} from '../src/index.js';
import { loadFixture } from './fixture.js';

function detectFixture(name: string) {
  const snapshot = buildRepeatedStructureSnapshot(loadFixture(name), `https://example.com/${name}`);
  return analyzeRepeatedStructures(snapshot);
}

describe('bounded repeated-structure detection', () => {
  it('detects repeated cards and suggests useful recipe fields from a fixture', () => {
    const result = detectFixture('repeated-cards');
    const candidate = result.candidates[0];

    expect(candidate).toMatchObject({
      itemCount: 6,
      selector: 'article.workshop-card',
    });
    expect(candidate?.confidence).toBeGreaterThanOrEqual(80);
    expect(candidate?.reasons).toEqual(
      expect.arrayContaining(['repeated_siblings', 'shared_class', 'meaningful_text', 'links']),
    );
    expect(candidate?.suggestedFields).toEqual(
      expect.arrayContaining([
        { mode: 'text', name: 'title', selector: 'h2' },
        { mode: 'href', name: 'url', selector: 'a' },
      ]),
    );
    expect(candidate ? candidateToRecipe(candidate) : undefined).toMatchObject({
      itemSelector: 'article.workshop-card',
      fields: expect.arrayContaining([
        expect.objectContaining({ mode: 'text', name: 'title', selector: 'h2' }),
      ]),
    });
  });

  it('suggests title, price, URL, and image fields for product cards', () => {
    const candidate = detectFixture('products').candidates[0];

    expect(candidate?.selector).toBe('article.product-card');
    expect(candidate?.itemCount).toBe(3);
    expect(candidate?.suggestedFields).toEqual([
      { mode: 'text', name: 'title', selector: '.product-title' },
      { mode: 'text', name: 'price', selector: '.price' },
      { mode: 'href', name: 'url', selector: 'a' },
      { mode: 'src', name: 'image', selector: 'img' },
    ]);
  });

  it('avoids tiny navigation-only siblings and ordinary article paragraphs', () => {
    const navigation = `<!doctype html><html><body><nav><ul>${Array.from(
      { length: 8 },
      (_, index) => `<li><a href="/${index}">N${index}</a></li>`,
    ).join('')}</ul></nav></body></html>`;
    const navigationResult = analyzeRepeatedStructures(
      buildRepeatedStructureSnapshot(navigation, 'https://example.com'),
    );

    expect(navigationResult.candidates).toEqual([]);
    expect(detectFixture('article').candidates).toEqual([]);
  });

  it('enforces node and candidate caps on pathological markup', () => {
    const groups = Array.from(
      { length: 20 },
      (_, group) =>
        `<section class="group-${group}">${Array.from(
          { length: 200 },
          (_, item) =>
            `<article class="card-${group}"><h2>Item ${item}</h2><a href="/${group}/${item}">Open</a></article>`,
        ).join('')}</section>`,
    ).join('');
    const snapshot = buildRepeatedStructureSnapshot(
      `<!doctype html><html><body>${groups}</body></html>`,
      'https://example.com',
    );
    const result = analyzeRepeatedStructures(snapshot);

    expect(snapshot.nodes.length).toBeLessThanOrEqual(SMART_DETECTION_LIMITS.nodes);
    expect(snapshot.truncated).toBe(true);
    expect(result.candidates.length).toBeLessThanOrEqual(SMART_DETECTION_LIMITS.candidates);
  });
});
