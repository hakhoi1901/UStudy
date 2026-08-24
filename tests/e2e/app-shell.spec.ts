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

test('opens the guide center before first-run setup is complete', async ({ page }) => {
  await page.goto('/guide');

  await expect(page).toHaveURL(/\/guide$/);
  await expect(page.getByRole('heading', { name: 'Hướng dẫn sử dụng UStudy' })).toBeVisible();
  await expect(page.getByPlaceholder(/Tìm hướng dẫn/)).toBeVisible();
  await expect(page.getByText('Đồng bộ dữ liệu từ HCMUS Portal')).toBeVisible();
});

test('starts and closes an interactive guide on a configured profile', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('department_configured', 'true');
    localStorage.setItem('selected_faculty_id', JSON.stringify('khoa-cntt'));
    localStorage.setItem('selected_major_id', JSON.stringify('cong-nghe-thong-tin'));
    localStorage.setItem('selected_cohort_id', JSON.stringify('k24'));
  });

  await page.goto('/guide/data-sync');
  await page.getByRole('button', { name: /Bắt đầu thực hành/ }).click();

  await expect(page).toHaveURL(/\/settings$/);
  await expect(
    page.locator('[data-guide="settings-sync-tools"]').getByRole('heading', { name: 'Công cụ đồng bộ dữ liệu' }),
  ).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('alertdialog')).toContainText('Công cụ đồng bộ dữ liệu');
  await expect(page.getByRole('button', { name: 'Thoát hướng dẫn' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
});

test('runs the GPA guide with transient demo data on a first-run profile', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/guide/gpa');
  await page.getByRole('button', { name: 'Dùng dữ liệu mẫu' }).click();

  await expect(page).toHaveURL(/\/grades$/);
  await expect(page.locator('[data-guide="gpa-planning-modes"]')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('alertdialog')).toContainText('Mở Kế hoạch GPA');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  expect(runtimeErrors).toEqual([]);
});

test('opens group preferences with demo members from the personal schedule view', async ({ page }) => {
  await page.goto('/guide/group-preferences');
  await page.getByRole('button', { name: 'Dùng dữ liệu mẫu' }).click();

  await expect(page).toHaveURL(/\/study-roadmap\/calendar$/);
  await expect(page.locator('[data-guide="group-general-prefs"]')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('alertdialog')).toContainText('Tổng quan ưu tiên chung');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
});
