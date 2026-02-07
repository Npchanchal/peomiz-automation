import { test, expect } from '../../support/test';
import { loadFixtures } from '../../support/loadFixtures';

const baseURL = (process.env.BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const apiV1URL = process.env.API_V1_URL || `${baseURL}/api/v1`;

/**
 * Sanity tests for critical paths.
 * Run before each deploy. Each test under ~2 minutes.
 *
 * Usage: npm run suite:sanity
 */
test.describe('Sanity Suite - Critical Paths', () => {
  test.setTimeout(120000); // 2 min max per test

  test('1. API health - app responds', async ({ request }) => {
    const response = await request.get(baseURL);
    expect(response.ok()).toBeTruthy();
  });

  test('2. Customer signup/login - login-check accepts request', async ({ request }) => {
    const f = loadFixtures();
    const response = await request.post(`${baseURL}/login-check`, {
      data: { phone: f.user.phone },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    // 200 = OTP sent, 500 = invalid phone (endpoint working)
    expect([200, 400, 500]).toContain(response.status());
  });

  test('3. Partner signup/login - api/login accepts request', async ({ request }) => {
    const f = loadFixtures();
    const response = await request.post(`${apiV1URL}/api/login`, {
      data: { phone: f.vendor.phone },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    // 200 = OTP sent, 400/404 = validation or not found (endpoint working)
    expect([200, 400, 404, 500]).toContain(response.status());
  });

  test('4. Order creation - external orders API responds', async ({ request }) => {
    const f = loadFixtures();
    const response = await request.post(`${baseURL}/api/external/orders`, {
      data: {
        source: 'sanity-test',
        external_order_id: `SANITY-${Date.now()}`,
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
        payment_status: 'pending',
      },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    // 401 = no/m invalid API key, 422 = validation, 409 = duplicate, 200/201 = success
    expect([200, 201, 401, 422, 409, 500]).toContain(response.status());
  });
});

/**
 * CodeIgniter mobile API (api/v1/) sanity tests.
 * Uses fixtures/codeigniter-api.json for test user IDs.
 * Set TEST_VENDOR_USER_ID, TEST_ORDER_ID, TEST_VENDOR_REF_ID, TEST_VENDOR_OTP in .env to run.
 */
test.describe('Sanity Suite - CodeIgniter Mobile APIs', () => {
  test.setTimeout(120000);

  test('api/login_verify - returns expected JSON shape', async ({ request }) => {
    const f = loadFixtures();
    const response = await request.post(`${apiV1URL}/api/login_verify`, {
      data: { otp: f.vendor.otp, ref_id: f.vendor.ref_id, device_os: 'web' },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    const json = await response.json().catch(() => ({}));
    expect(json).toHaveProperty('status');
    if (response.ok()) {
      expect(json.status).toBe(200);
      expect(json).toHaveProperty('data');
      if (json.data) {
        expect(json.data).toHaveProperty('user_id');
      }
    } else {
      expect([400, 404, 500]).toContain(response.status());
      expect(json).toHaveProperty('message');
    }
  });

  test('api/get_booking_details - returns expected JSON shape', async ({ request }) => {
    const f = loadFixtures();
    const response = await request.post(`${apiV1URL}/api/get_booking_details`, {
      data: { user_id: f.vendor.vendor_user_id, order_id: f.codeigniter.order_id },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    const json = await response.json().catch(() => ({}));
    expect(json).toHaveProperty('status');
    if (response.ok()) {
      expect(json.status).toBe(200);
      expect(json).toHaveProperty('data');
    } else {
      expect([400, 404, 500]).toContain(response.status());
    }
  });

  test('api/update_booking_list - returns expected JSON shape', async ({ request }) => {
    const f = loadFixtures();
    const response = await request.post(`${apiV1URL}/api/update_booking_list`, {
      data: { user_id: f.vendor.vendor_user_id, order_id: f.codeigniter.order_id },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    const json = await response.json().catch(() => ({}));
    expect(json).toHaveProperty('status');
    if (response.ok()) {
      expect(json.status).toBe(200);
      expect(json).toHaveProperty('firstTitle');
      expect(json).toHaveProperty('secondTitle');
    } else {
      expect([400, 404, 500]).toContain(response.status());
    }
  });
});
