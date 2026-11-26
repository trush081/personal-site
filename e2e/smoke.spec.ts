import { expect, test } from '@playwright/test';

const pages = [
  { path: '/', heading: 'About this site' },
  { path: '/about', heading: 'About Me' },
  { path: '/resume', heading: 'Resume' },
  { path: '/projects', heading: 'Projects' },
  { path: '/stats', heading: 'Stats' },
  { path: '/contact', heading: 'Contact' },
  { path: '/login', heading: 'Sign in' },
];

for (const { path, heading } of pages) {
  test(`${path} renders`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('unknown pages return 404', async ({ page }) => {
  const res = await page.goto('/definitely-not-a-page');
  expect(res?.status()).toBe(404);
});

test.describe('signed out', () => {
  for (const path of ['/dashboard', '/dashboard/manage/users', '/dashboard/content/about']) {
    test(`${path} redirects to login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path)}$`));
    });
  }
});

test('legacy /admin URLs redirect', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
});
