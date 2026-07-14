import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { monitorRuntimeErrors } from './runtime-errors';

async function expectNoWcagViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
}

for (const route of ['/en', '/fa', '/en/docs', '/fa/playground/products'] as const) {
  test(`${route} has no automatically detectable WCAG A/AA violations`, async ({ page }) => {
    const expectNoRuntimeErrors = monitorRuntimeErrors(page);
    await page.goto(route);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expectNoWcagViolations(page);
    expectNoRuntimeErrors();
  });
}

test('loaded workspace and mobile navigation pass automated accessibility checks', async ({
  page,
}) => {
  const expectNoRuntimeErrors = monitorRuntimeErrors(page);
  await page.goto('/fa/scrape?demo=products');
  await expect(page.getByRole('heading', { name: 'نتیجه آمادهٔ بررسی است.' })).toBeVisible();
  await expectNoWcagViolations(page);

  await page.setViewportSize({ height: 844, width: 390 });
  await page.getByRole('button', { name: 'باز کردن منوی پیمایش' }).click();
  await expect(page.getByRole('dialog', { name: 'پیمایش' })).toBeVisible();
  await expectNoWcagViolations(page);
  expectNoRuntimeErrors();
});
