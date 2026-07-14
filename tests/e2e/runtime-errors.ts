import { expect, type Page } from '@playwright/test';

export function monitorRuntimeErrors(page: Page): () => void {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));

  return () => expect(errors).toEqual([]);
}
