import { expect, test } from '@playwright/test';

import { monitorRuntimeErrors } from './runtime-errors';

test('switches locale, direction, and keyboard-safe mobile navigation', async ({ page }) => {
  const expectNoRuntimeErrors = monitorRuntimeErrors(page);
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

  await page.getByRole('button', { name: 'Switch language to فارسی' }).click();
  await expect(page).toHaveURL(/\/fa$/u);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#main-content')).toBeFocused();

  await page.setViewportSize({ height: 844, width: 390 });
  const menuButton = page.getByRole('button', { name: 'باز کردن منوی پیمایش' });
  await menuButton.click();
  await expect(page.getByRole('dialog', { name: 'پیمایش' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'پیمایش' })).toBeHidden();
  await expect(menuButton).toBeFocused();
  expectNoRuntimeErrors();
});

test('analyzes the bundled table without an API request', async ({ page }) => {
  const expectNoRuntimeErrors = monitorRuntimeErrors(page);
  const apiRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/')) apiRequests.push(request.url());
  });

  await page.goto('/en/playground/table');
  await page.getByRole('link', { name: 'Analyze this demo' }).click();
  await expect(page).toHaveURL(/\/en\/scrape\?demo=table$/u);
  await expect(page.getByRole('heading', { name: 'The page is ready to inspect.' })).toBeVisible();
  await page.getByRole('button', { name: /Tables/u }).click();
  await expect(page.getByText('8 rows × 5 columns')).toBeVisible();
  expect(apiRequests).toEqual([]);
  expectNoRuntimeErrors();
});

test('saves, exports, reopens, and clears local workflow data', async ({ page }) => {
  const expectNoRuntimeErrors = monitorRuntimeErrors(page);
  await page.goto('/en/scrape?demo=products');
  await expect(page.getByRole('heading', { name: 'The page is ready to inspect.' })).toBeVisible({
    timeout: 20_000,
  });

  await page.getByRole('button', { name: 'Custom extractor' }).click();
  await page.getByRole('button', { name: 'Use demo recipe' }).click();
  await page.getByLabel('Recipe name').fill('Phase 10 products');
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByText('Recipe saved locally.')).toBeVisible();
  await page.getByRole('button', { name: 'Run custom extraction' }).click();
  await expect(page.getByRole('heading', { name: 'Multi-field preview' })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download JSON' }).click();
  await expect((await downloadPromise).suggestedFilename()).toMatch(/\.json$/u);

  await page.getByRole('link', { name: 'Recipes' }).first().click();
  await expect(page.getByRole('textbox', { name: 'Recipe name' })).toHaveValue('Phase 10 products');
  await page.getByRole('link', { name: 'Reopen' }).click();
  await expect(page).toHaveURL(/\/en\/scrape\?recipe=/u);
  await expect(page.getByText(/Recipe loaded/u)).toBeVisible();
  await page.getByRole('button', { name: 'Load sample demo' }).click();
  await expect(page.getByLabel('Repeating item selector')).toHaveValue('article');

  await page.getByRole('link', { name: 'History' }).first().click();
  await expect(page.locator('.history-list > li')).toHaveCount(3);
  await page.getByRole('button', { name: 'Clear history' }).click();
  await page.getByRole('button', { name: 'Clear permanently' }).click();
  await expect(page.getByText('No local history yet')).toBeVisible();
  expectNoRuntimeErrors();
});
