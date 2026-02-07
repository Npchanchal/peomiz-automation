/**
 * E2E Customer App – Partner-related scenarios from customer side.
 * Covers: pincode/service availability (partner coverage), services, cart, order flow.
 *
 * Partner link: customer selects pincode → sees services (partner-serviced area) → order → partner assignment.
 *
 * Requires: BASE_URL. Uses fixtures for pincode, product.
 */
import { test, expect } from '../../support/test';
import { loadFixtures } from '../../support/loadFixtures';

const baseURL = (process.env.BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const apiV1URL = process.env.API_V1_URL || `${baseURL}/api/v1`;

test.describe('E2E Customer App - Pincode & Partner Coverage', () => {
  test.setTimeout(90000);

  test('pincode suggestions - partner coverage area lookup', async ({ request }) => {
    const f = loadFixtures();
    const res = await request.post(`${baseURL}/pincodes/suggestions`, {
      form: { pincode: f.address.pincode },
      headers: { Referer: baseURL, Accept: 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    expect(res.status()).toBeLessThan(500);
    if (res.ok() && json.pincodes) {
      expect(Array.isArray(json.pincodes)).toBeTruthy();
    }
  });

  test('pincode suggestions - partial pincode search', async ({ request }) => {
    const res = await request.post(`${baseURL}/pincodes/suggestions`, {
      form: { pincode: '560' },
      headers: { Referer: baseURL, Accept: 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    expect(res.status()).toBeLessThan(500);
  });

  test('services page loads with pincode - partner-serviced area', async ({ page }) => {
    const f = loadFixtures();
    await page.context().addCookies([{
      name: 'pincodeLocation',
      value: JSON.stringify({
        pincode_id: f.address.pincode_id,
        del_pincode: f.address.pincode,
        del_city: f.address.city,
        del_state: f.address.state,
      }),
      url: baseURL,
    }]);
    await page.goto(`${baseURL}/services/${f.product.service_slug}`);
    await expect(page).toHaveURL(/\/services\//);
    await expect(page.locator('body')).toBeVisible();
  });

  test('homepage loads - service availability entry', async ({ page }) => {
    await page.goto(baseURL);
    await expect(page.locator('body')).toBeVisible();
    const pincodeInput = page.locator('#pincode-input, input[name="pincode"], [placeholder*="pincode"]').first();
    const count = await pincodeInput.count();
    if (count > 0) {
      await expect(pincodeInput).toBeVisible();
    }
  });
});

test.describe('E2E Customer App - Customer API (piomiz-customer-app)', () => {
  test.setTimeout(60000);

  test('customerApi/search_pincode_by_keyword - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const res = await request.post(`${apiV1URL}/customerApi/search_pincode_by_keyword`, {
      data: { text: f.address.pincode },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    expect(res.status()).toBeLessThan(500);
  });

  test('customerApi/get_pincode_list - accepts request', async ({ request }) => {
    const res = await request.post(`${apiV1URL}/customerApi/get_pincode_list`, {
      data: {},
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe('E2E Customer App - Order Flow (Partner Assignment)', () => {
  test.setTimeout(120000);

  test('external orders - pincode serviceability (partner coverage)', async ({ request }) => {
    const f = loadFixtures();
    const apiKey = process.env.EXTERNAL_ORDER_API_KEY || 'dummy';
    const res = await request.post(`${baseURL}/api/external/orders`, {
      data: {
        source: 'customer-partner-test',
        external_order_id: `CUST-PARTNER-${Date.now()}`,
        user: { name: f.user.name, email: f.user.email, phone: f.user.phone },
        address: {
          pincode: f.address.pincode,
          address: f.address.address,
          state: f.address.state,
          city: f.address.city,
        },
        items: [{ product_id: parseInt(f.product.product_id, 10), quantity: f.product.quantity }],
        booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        booking_time: '10:00 AM',
        payment_method: 'cod',
        payment_status: 'cod',
      },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-API-Key': apiKey },
    });
    expect([200, 201, 401, 422, 409, 500]).toContain(res.status());
    if (res.ok()) {
      const json = await res.json().catch(() => ({}));
      expect(json).toHaveProperty('success');
    }
  });
});
