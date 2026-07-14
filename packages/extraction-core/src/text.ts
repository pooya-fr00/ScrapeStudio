const EXCLUDED_TEXT_CONTAINERS = new Set(['NOSCRIPT', 'SCRIPT', 'STYLE', 'SVG', 'TEMPLATE']);

export function normalizeText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/gu, ' ').trim();
}

export function visibleDocumentText(document: Document): string {
  const root = document.body;
  if (!root) {
    return '';
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const parts: string[] = [];
  let node = walker.nextNode();

  while (node) {
    const parent = node.parentElement;
    let excluded = false;
    let ancestor: Element | null = parent;
    while (ancestor) {
      if (EXCLUDED_TEXT_CONTAINERS.has(ancestor.tagName)) {
        excluded = true;
        break;
      }
      ancestor = ancestor.parentElement;
    }

    if (parent && !excluded) {
      const text = normalizeText(node.nodeValue);
      if (text) {
        parts.push(text);
      }
    }
    node = walker.nextNode();
  }

  return normalizeText(parts.join(' '));
}
