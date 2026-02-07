/**
 * E2E Customer Dashboard – Admin backend customer management scenarios.
 * Covers: customers list, bookings (customer orders), complaints.
 *
 * Requires: TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD. Uses page-based admin login.
 */
import { test, expect } from '../../support/test';

const baseURL = (process.env.BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

async function adminLogin(page: import('@playwright/test').Page) {
  const adminEmail = process.env.TEST_ADMIN_EMAIL || '';
  const adminPassword = process.env.TEST_ADMIN_PASSWORD || '';
  if (!adminEmail || !adminPassword) {
    return false;
  }
  await page.goto(`${baseURL}/backend/login`);
  await page.fill('input[name="email"], input[name="username"]', adminEmail);
  await page.fill('input[name="password"]', adminPassword);
  await page.click('button[type="submit"], input[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  return page.url().includes('/admin');
}

test.describe('E2E Customer Dashboard - Admin Backend', () => {
  test.setTimeout(120000);

  test('dashboard - customers page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/customers`);
    expect(page.url()).toMatch(/\/admin\/customers/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard - all bookings page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/bookings`);
    expect(page.url()).toMatch(/\/admin\/bookings/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard - pending payments page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/bookings/pending-payments`);
    expect(page.url()).toMatch(/\/admin\/bookings/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard - confirmed bookings page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/bookings/confirmed-booking`);
    expect(page.url()).toMatch(/\/admin\/bookings/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard - assigned bookings page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/bookings/assigned-booking`);
    expect(page.url()).toMatch(/\/admin\/bookings/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard - completed bookings page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/bookings/completed-booking`);
    expect(page.url()).toMatch(/\/admin\/bookings/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard - complaints page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/complaints`);
    expect(page.url()).toMatch(/\/admin\/complaints/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('dashboard - booking complaints page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/bookings/booking-complaints`);
    expect(page.url()).toMatch(/\/admin\/bookings/);
    await expect(page.locator('body')).toBeVisible();
  });
});
