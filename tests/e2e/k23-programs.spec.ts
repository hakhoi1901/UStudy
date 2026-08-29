import { expect, test } from '@playwright/test';

const K23_PROGRAMS = [
  ['khoa-cntt', 'cong-nghe-thong-tin'],
  ['khoa-cntt', 'he-thong-thong-tin'],
  ['khoa-cntt', 'ky-thuat-phan-mem'],
  ['khoa-cntt', 'khoa-hoc-may-tinh'],
  ['khoa-cntt', 'tri-tue-nhan-tao'],
  ['khoa-cntt', 'cu-nhan-tai-nang'],
  ['khoa-khoa-hoc-va-cong-nghe-vat-lieu', 'khoa-hoc-vat-lieu'],
  ['khoa-khoa-hoc-va-cong-nghe-vat-lieu', 'cong-nghe-vat-lieu'],
  ['khoa-toan', 'toan-hoc'],
  ['khoa-toan', 'toan-tin'],
  ['khoa-toan', 'toan-ung-dung'],
  ['khoa-toan', 'khoa-hoc-du-lieu'],
  ['khoa-toan', 'cu-nhan-tai-nang'],
  ['khoa-dia-chat', 'dia-chat-hoc'],
  ['khoa-dia-chat', 'ky-thuat-dia-chat'],
  ['khoa-ly', 'vat-ly-hoc'],
  ['khoa-ly', 'vat-ly-y-khoa'],
  ['khoa-ly', 'hai-duong-hoc'],
  ['khoa-ly', 'ky-thuat-hat-nhan'],
  ['khoa-ly', 'cong-nghe-vat-ly-dien-tu-va-tin-hoc'],
  ['khoa-ly', 'cu-nhan-tai-nang-vat-ly-hoc'],
  ['khoa-hoa', 'hoa-hoc'],
  ['khoa-hoa', 'cu-nhan-tai-nang'],
  ['khoa-sinh', 'sinh-hoc'],
  ['khoa-sinh', 'cong-nghe-sinh-hoc'],
  ['khoa-moi-truong', 'cong-nghe-ky-thuat-moi-truong'],
  ['khoa-moi-truong', 'khoa-hoc-moi-truong'],
  ['khoa-moi-truong', 'quan-ly-tai-nguyen-va-moi-truong'],
  ['khoa-dien-tu-vien-thong', 'ky-thuat-dien-tu-vien-thong'],
] as const;

test('loads all 29 direct K23 programs sequentially without curriculum runtime errors', async ({ page }) => {
  test.setTimeout(120_000);
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && /DepartmentContext|academic-programs|Failed to load data/i.test(message.text())) {
      runtimeErrors.push(message.text());
    }
  });

  await page.goto('/privacy');

  for (const [facultyId, majorId] of K23_PROGRAMS) {
    await page.evaluate(({ facultyId: faculty, majorId: major }) => {
      localStorage.setItem('department_configured', JSON.stringify(true));
      localStorage.setItem('selected_cohort_id', JSON.stringify('k23'));
      localStorage.setItem('selected_faculty_id', JSON.stringify(faculty));
      localStorage.setItem('selected_major_id', JSON.stringify(major));
      localStorage.setItem('ustudy_last_data_import', JSON.stringify({
        at: '2026-08-29T00:00:00.000Z',
        source: 'json',
      }));
    }, { facultyId, majorId });

    await page.goto('/study-roadmap/program', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/study-roadmap\/program$/);
    await expect(page.getByRole('heading', { name: 'Chương trình đào tạo toàn khóa' })).toBeVisible();
    await expect(page.getByText('Đang cập nhật dữ liệu')).toHaveCount(0);
  }

  expect(runtimeErrors).toEqual([]);
});
