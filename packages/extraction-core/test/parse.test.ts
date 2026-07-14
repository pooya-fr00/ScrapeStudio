import { describe, expect, it } from 'vitest';

import { parseDetachedPage, resolveHttpUrl } from '../src/index';

describe('detached page parser and URL resolution', () => {
  it('parses into a detached document without attaching remote nodes to the live page', () => {
    const page = parseDetachedPage(
      '<main id="remote"><script>window.executed = true</script><h1>Hello</h1></main>',
      'https://example.com/articles/one',
    );

    expect(page.document.querySelector('h1')?.textContent).toBe('Hello');
    expect(document.querySelector('#remote')).toBeNull();
    expect(page.document).not.toBe(document);
    expect(Object.hasOwn(window, 'executed')).toBe(false);
  });

  it('uses the first valid HTTP base element for relative URL resolution', () => {
    const page = parseDetachedPage(
      '<base href="https://cdn.example.org/assets/"><a href="guide">Guide</a>',
      'https://example.com/articles/one',
    );

    expect(page.baseUrl.toString()).toBe('https://cdn.example.org/assets/');
    expect(resolveHttpUrl('guide', page.baseUrl)?.toString()).toBe(
      'https://cdn.example.org/assets/guide',
    );
  });

  it('ignores unsupported base protocols and rejects invalid final URLs', () => {
    const page = parseDetachedPage(
      '<base href="javascript:alert(1)"><a href="guide">Guide</a>',
      'https://example.com/articles/one',
    );

    expect(page.baseUrl.toString()).toBe('https://example.com/articles/one');
    expect(() => parseDetachedPage('<p>hello</p>', 'file:///tmp/page')).toThrow(TypeError);
    expect(() => parseDetachedPage('<p>hello</p>', 'not a url')).toThrow(TypeError);
  });
});
