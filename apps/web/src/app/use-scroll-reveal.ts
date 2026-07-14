import { useEffect } from 'react';

const REVEAL_SELECTOR = '[data-reveal]';

function revealImmediately(root: ParentNode): void {
  for (const element of root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)) {
    element.classList.add('is-visible');
  }
}

function isInsideInitialViewport(element: HTMLElement): boolean {
  const bounds = element.getBoundingClientRect();
  return bounds.bottom >= 0 && bounds.top <= window.innerHeight * 0.92;
}

export function useScrollReveal(pathname: string, enabled = true): void {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const root = document.querySelector('#main-content');
    if (!root) {
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      revealImmediately(root);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    const revealOrObserve = (element: HTMLElement) => {
      if (isInsideInitialViewport(element)) {
        element.classList.add('is-visible');
      } else {
        observer.observe(element);
      }
    };

    const observeElement = (element: Element) => {
      if (element instanceof HTMLElement && element.matches(REVEAL_SELECTOR)) {
        revealOrObserve(element);
      }
      for (const descendant of element.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)) {
        revealOrObserve(descendant);
      }
    };

    for (const element of root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)) {
      revealOrObserve(element);
    }

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof Element) {
            observeElement(node);
          }
        }
      }
    });
    mutations.observe(root, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, [enabled, pathname]);
}
