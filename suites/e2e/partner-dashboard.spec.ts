/**
 * E2E Partner Dashboard – Admin backend partner management scenarios.
 * Covers: pending, approved, returned partners; KYC approve/return; assessment; partner details.
 *
 * Requires: TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD. Uses page-based admin login.
 */
import { test, expect } from '../../support/test';
import { loadFixtures } from '../../support/loadFixtures';

const baseURL = (process.env.BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

test.describe('E2E Partner Dashboard - Admin Backend', () => {
  test.setTimeout(120000);

  test('admin login - backend login page loads', async ({ page }) => {
    await page.goto(`${baseURL}/backend/login`);
    await expect(page).toHaveURL(/\/backend\/login/);
    await expect(page.locator('input[name="email"], input[name="username"]')).toBeVisible();
  });

  test('admin login - valid credentials redirect to admin', async ({ page }) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || '';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || '';
    if (!adminEmail || !adminPassword) {
      test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    }

    await page.goto(`${baseURL}/backend/login`);
    await page.fill('input[name="email"], input[name="username"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    expect(page.url()).toContain('/admin');
  });

  test('dashboard - pending partners page loads', async ({ page }) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || '';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || '';
    if (!adminEmail || !adminPassword) {
      test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    }

    await page.goto(`${baseURL}/backend/login`);
    await page.fill('input[name="email"], input[name="username"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    await page.goto(`${baseURL}/admin/partners`);
    expect(page.url()).toMatch(/\/admin\/partners/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard - approved partners page loads', async ({ page }) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || '';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || '';
    if (!adminEmail || !adminPassword) {
      test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    }

    await page.goto(`${baseURL}/backend/login`);
    await page.fill('input[name="email"], input[name="username"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    await page.goto(`${baseURL}/admin/partners/approved`);
    expect(page.url()).toMatch(/\/admin\/partners/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard - returned partners page loads', async ({ page }) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || '';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || '';
    if (!adminEmail || !adminPassword) {
      test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    }

    await page.goto(`${baseURL}/backend/login`);
    await page.fill('input[name="email"], input[name="username"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    await page.goto(`${baseURL}/admin/partners/returned`);
    expect(page.url()).toMatch(/\/admin\/partners/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard - assessment approval page loads', async ({ page }) => {
    const adminEmail = process.env.TEST_ADMIN_EMAIL || '';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || '';
    if (!adminEmail || !adminPassword) {
      test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    }

    await page.goto(`${baseURL}/backend/login`);
    await page.fill('input[name="email"], input[name="username"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    await page.goto(`${baseURL}/admin/partners/assessment-approval`);
    expect(page.url()).toMatch(/\/admin\/partners/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard - partner details page loads (when vendor_id provided)', async ({ page }) => {
    const f = loadFixtures();
    const vendorId = f.vendor.vendor_id;
    if (!vendorId) {
      test.skip(true, 'Set TEST_VENDOR_ID for partner details test');
    }

    const adminEmail = process.env.TEST_ADMIN_EMAIL || '';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || '';
    if (!adminEmail || !adminPassword) {
      test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    }

    await page.goto(`${baseURL}/backend/login`);
    await page.fill('input[name="email"], input[name="username"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    await page.goto(`${baseURL}/admin/partners/vendor-details/${vendorId}`);
    expect(page.url()).toContain(`/vendor-details/${vendorId}`);
    await expect(page.locator('body')).toBeVisible();
  });
});
