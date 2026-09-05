import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
  await context.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test('opens the first-run setup without runtime errors', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/');

  await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByRole('heading', { name: 'Chào mừng bạn' })).toBeVisible();
  await expect(page.getByText('Chương trình đào tạo', { exact: true })).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test('keeps the setup page inside the mobile viewport', async ({ page }) => {
  await page.goto('/setup');
  await expect(page.getByRole('heading', { name: 'Chào mừng bạn' })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('serves the privacy route directly for SPA refreshes', async ({ page }) => {
  await page.goto('/privacy');

  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole('main')).toContainText(/UStudy|bảo mật|riêng tư/i);
});
