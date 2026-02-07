/**
 * E2E Admin Dashboard – All admin backend scenarios.
 * Covers: dashboard, customers, partners, bookings, payment, services, fulfillment, settings.
 * Admin-impacted flows in customer/partner apps: full-flow.spec.ts, partner-app-api, customer-app-partner.
 *
 * Requires: TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD. Optional: TEST_VENDOR_ID for partner details.
 */
import { test, expect } from '../../support/test';
import { loadFixtures } from '../../support/loadFixtures';

const baseURL = (process.env.BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

async function adminLogin(page: import('@playwright/test').Page) {
  const adminEmail = process.env.TEST_ADMIN_EMAIL || '';
  const adminPassword = process.env.TEST_ADMIN_PASSWORD || '';
  if (!adminEmail || !adminPassword) return false;
  await page.goto(`${baseURL}/backend/login`);
  await page.fill('input[name="email"], input[name="username"]', adminEmail);
  await page.fill('input[name="password"]', adminPassword);
  await page.click('button[type="submit"], input[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  return page.url().includes('/admin');
}

test.describe('E2E Admin Dashboard - Core', () => {
  test.setTimeout(90000);

  test('admin login page loads', async ({ page }) => {
    await page.goto(`${baseURL}/backend/login`);
    await expect(page).toHaveURL(/\/backend\/login/);
    await expect(page.locator('input[name="email"], input[name="username"], input[name="password"]')).toBeVisible();
  });

  test('admin login - valid credentials redirect to admin', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    expect(page.url()).toContain('/admin');
  });

  test('dashboard home loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin`);
    expect(page.url()).toMatch(/\/admin/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin profile page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/profile`);
    expect(page.url()).toMatch(/\/admin/);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('E2E Admin Dashboard - Customers & Complaints', () => {
  test.setTimeout(90000);

  test('customers page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/customers`);
    expect(page.url()).toMatch(/\/admin\/customers/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('complaints page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/complaints`);
    expect(page.url()).toMatch(/\/admin\/complaints/);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('E2E Admin Dashboard - Bookings', () => {
  test.setTimeout(90000);

  test('all bookings page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/bookings`);
    expect(page.url()).toMatch(/\/admin\/bookings/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('pending payments page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/bookings/pending-payments`);
    expect(page.url()).toMatch(/\/admin\/bookings/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('confirmed bookings page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/bookings/confirmed-booking`);
    expect(page.url()).toMatch(/\/admin\/bookings/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('assigned bookings page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/bookings/assigned-booking`);
    expect(page.url()).toMatch(/\/admin\/bookings/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('completed bookings page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/bookings/completed-booking`);
    expect(page.url()).toMatch(/\/admin\/bookings/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('booking complaints (cancelled) page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/bookings/booking-complaints`);
    expect(page.url()).toMatch(/\/admin\/bookings/);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('E2E Admin Dashboard - Payment', () => {
  test.setTimeout(90000);

  test('payment pending page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/payment/pending`);
    expect(page.url()).toMatch(/\/admin\/payment/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('payment complete page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/payment/complete`);
    expect(page.url()).toMatch(/\/admin\/payment/);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('E2E Admin Dashboard - Partners', () => {
  test.setTimeout(90000);

  test('pending partners page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/partners`);
    expect(page.url()).toMatch(/\/admin\/partners/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('returned partners page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/partners/returned`);
    expect(page.url()).toMatch(/\/admin\/partners/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('approved partners page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/partners/approved`);
    expect(page.url()).toMatch(/\/admin\/partners/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('assessment approval page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/partners/assessment-approval`);
    expect(page.url()).toMatch(/\/admin\/partners/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('partner vendor-details page loads (when TEST_VENDOR_ID provided)', async ({ page }) => {
    const f = loadFixtures();
    const vendorId = f.vendor.vendor_id;
    if (!vendorId) test.skip(true, 'Set TEST_VENDOR_ID for partner details');
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/partners/vendor-details/${vendorId}`);
    expect(page.url()).toContain(`/vendor-details/${vendorId}`);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('E2E Admin Dashboard - Account (Pending/Completed)', () => {
  test.setTimeout(90000);

  test('pending (account) page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/pending`);
    expect(page.url()).toMatch(/\/admin/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('completed (account) page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/completed`);
    expect(page.url()).toMatch(/\/admin/);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('E2E Admin Dashboard - Services & Fulfillment', () => {
  test.setTimeout(90000);

  test('products (services) page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/products`);
    expect(page.url()).toMatch(/\/admin\/products/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('categories page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/products/category`);
    expect(page.url()).toMatch(/\/admin\/products/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('states page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/logistics/states`);
    expect(page.url()).toMatch(/\/admin/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('cities page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/logistics/cities`);
    expect(page.url()).toMatch(/\/admin/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('pincode page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/logistics/pincode`);
    expect(page.url()).toMatch(/\/admin/);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('E2E Admin Dashboard - Settings & Content', () => {
  test.setTimeout(90000);

  test('premium settings page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/settings/premium-settings`);
    expect(page.url()).toMatch(/\/admin/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('banner management page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/banners`);
    expect(page.url()).toMatch(/\/admin/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('HSN & GST page loads', async ({ page }) => {
    const ok = await adminLogin(page);
    if (!ok) test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    await page.goto(`${baseURL}/admin/products/hsn-gst`);
    expect(page.url()).toMatch(/\/admin/);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('E2E Admin - Impact on Customer & Partner Apps', () => {
  test.setTimeout(90000);
  test.describe.configure({ mode: 'serial' });

  test('admin-configured pincode flows to customer app (pincodes/suggestions)', async ({ request }) => {
    // Admin manages pincode in dashboard; customer app consumes via pincodes/suggestions.
    // Full verification: customer-app-partner.spec.ts (pincode, services).
    const base = (process.env.BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
    const r = await request.post(`${base}/pincodes/suggestions`, {
      form: { pincode: '560' },
      headers: { Referer: base, Accept: 'application/json' },
    });
    expect(r.status()).toBeLessThan(500);
  });

  test('admin-configured partner flows to partner app (CodeIgniter check_user_status)', async ({ request }) => {
    // Admin approves partners, assigns bookings; partner app reflects via CodeIgniter API.
    // Full verification: partner-app-api.spec.ts, full-flow.spec.ts.
    const base = (process.env.BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
    const apiV1 = process.env.API_V1_URL || `${base}/api/v1`;
    const r = await request.post(`${apiV1}/api/check_user_status`, {
      data: { user_id: '0' },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(r.status()).toBeLessThan(500);
  });
});
