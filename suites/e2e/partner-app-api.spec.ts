/**
 * E2E Partner App API – CodeIgniter API scenarios used by piomiz-vendor-app.
 * Covers: login, bookings, dashboard, ledger, training, assessment, bank details, notifications.
 *
 * Requires: TEST_VENDOR_PHONE, TEST_VENDOR_OTP, TEST_VENDOR_USER_ID for most tests.
 */
import { test, expect } from '../../support/test';
import { loadFixtures } from '../../support/loadFixtures';

const baseURL = (process.env.BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const apiV1URL = process.env.API_V1_URL || `${baseURL}/api/v1`;

test.describe('E2E Partner App API - Auth & Profile', () => {
  test.setTimeout(60000);

  test('api/login - partner login accepts request', async ({ request }) => {
    const f = loadFixtures();
    const res = await request.post(`${apiV1URL}/api/login`, {
      data: { phone: f.vendor.phone },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect([200, 400, 404, 500]).toContain(res.status());
    const json = await res.json().catch(() => ({}));
    expect(json).toHaveProperty('status');
  });

  test('api/login_verify - partner OTP verify returns expected shape', async ({ request }) => {
    const f = loadFixtures();
    if (!f.vendor.ref_id) {
      test.skip(true, 'Set TEST_VENDOR_REF_ID or run login first to get ref_id');
    }
    const res = await request.post(`${apiV1URL}/api/login_verify`, {
      data: { otp: f.vendor.otp, ref_id: f.vendor.ref_id, device_os: 'web' },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    expect(json).toHaveProperty('status');
    if (res.ok() && json.status === 200) {
      expect(json).toHaveProperty('data');
      if (json.data) expect(json.data).toHaveProperty('user_id');
    }
  });

  test('api/resend_otp - accepts request', async ({ request }) => {
    const f = loadFixtures();
    if (!f.vendor.ref_id) {
      test.skip(true, 'Set TEST_VENDOR_REF_ID for resend OTP');
    }
    const res = await request.post(`${apiV1URL}/api/resend_otp`, {
      data: { user_id: f.vendor.ref_id },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/check_user_status - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) {
      test.skip(true, 'Set TEST_VENDOR_USER_ID for check_user_status');
    }
    const res = await request.post(`${apiV1URL}/api/check_user_status`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/verified_user - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) {
      test.skip(true, 'Set TEST_VENDOR_USER_ID for verified_user');
    }
    const res = await request.post(`${apiV1URL}/api/verified_user`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe('E2E Partner App API - Bookings', () => {
  test.setTimeout(60000);

  test('api/get_order_details - pending bookings', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) {
      test.skip(true, 'Set TEST_VENDOR_USER_ID');
    }
    const res = await request.post(`${apiV1URL}/api/get_order_details`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    expect(json).toHaveProperty('status');
    expect(res.status()).toBeLessThan(500);
  });

  test('api/get_booking_details - booking details (by order_id)', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    const orderId = f.codeigniter.order_id;
    if (!userId || !orderId) {
      test.skip(true, 'Set TEST_VENDOR_USER_ID and TEST_ORDER_ID');
    }
    const res = await request.post(`${apiV1URL}/api/get_booking_details`, {
      data: { user_id: userId, order_id: orderId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    expect(json).toHaveProperty('status');
    expect(res.status()).toBeLessThan(500);
  });

  test('api/get_upcoming_bookings - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) test.skip(true, 'Set TEST_VENDOR_USER_ID');
    const res = await request.post(`${apiV1URL}/api/get_upcoming_bookings`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/get_ongoing_bookings - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) test.skip(true, 'Set TEST_VENDOR_USER_ID');
    const res = await request.post(`${apiV1URL}/api/get_ongoing_bookings`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/get_completed_bookings - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) test.skip(true, 'Set TEST_VENDOR_USER_ID');
    const res = await request.post(`${apiV1URL}/api/get_completed_bookings`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/get_cancelled_bookings - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) test.skip(true, 'Set TEST_VENDOR_USER_ID');
    const res = await request.post(`${apiV1URL}/api/get_cancelled_bookings`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/update_booking_list - accept booking', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    const orderId = f.codeigniter.order_id;
    if (!userId || !orderId) {
      test.skip(true, 'Set TEST_VENDOR_USER_ID and TEST_ORDER_ID');
    }
    const res = await request.post(`${apiV1URL}/api/update_booking_list`, {
      data: { user_id: userId, order_id: orderId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    expect(json).toHaveProperty('status');
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe('E2E Partner App API - Service Lifecycle (OTP)', () => {
  test.setTimeout(60000);

  test('api/generate_service_start_otp - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    const orderId = f.codeigniter.order_id;
    if (!userId || !orderId) test.skip(true, 'Set TEST_VENDOR_USER_ID and TEST_ORDER_ID');
    const res = await request.post(`${apiV1URL}/api/generate_service_start_otp`, {
      data: { user_id: userId, order_id: orderId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    expect(json).toHaveProperty('status');
    expect(res.status()).toBeLessThan(500);
  });

  test('api/generate_service_otp - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    const orderId = f.codeigniter.order_id;
    if (!userId || !orderId) test.skip(true, 'Set TEST_VENDOR_USER_ID and TEST_ORDER_ID');
    const res = await request.post(`${apiV1URL}/api/generate_service_otp`, {
      data: { user_id: userId, order_id: orderId, remarks: 'test' },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const json = await res.json().catch(() => ({}));
    expect(json).toHaveProperty('status');
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe('E2E Partner App API - Dashboard, Ledger, Training', () => {
  test.setTimeout(60000);

  test('api/get_dashboard_count - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) test.skip(true, 'Set TEST_VENDOR_USER_ID');
    const res = await request.post(`${apiV1URL}/api/get_dashboard_count`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/get_dashboard_comp_count - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) test.skip(true, 'Set TEST_VENDOR_USER_ID');
    const res = await request.post(`${apiV1URL}/api/get_dashboard_comp_count`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/customer_details - ledger accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) test.skip(true, 'Set TEST_VENDOR_USER_ID');
    const res = await request.post(`${apiV1URL}/api/customer_details`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/get_vendor_training_video_list - accepts request', async ({ request }) => {
    const res = await request.post(`${apiV1URL}/api/get_vendor_training_video_list`, {
      data: {},
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/get_vendor_assessment_form_list - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) test.skip(true, 'Set TEST_VENDOR_USER_ID');
    const res = await request.post(`${apiV1URL}/api/get_vendor_assessment_form_list`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/get_bank_details - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) test.skip(true, 'Set TEST_VENDOR_USER_ID');
    const res = await request.post(`${apiV1URL}/api/get_bank_details`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/app_notification_list - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) test.skip(true, 'Set TEST_VENDOR_USER_ID');
    const res = await request.post(`${apiV1URL}/api/app_notification_list`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/check_app_update - accepts request', async ({ request }) => {
    const res = await request.post(`${apiV1URL}/api/check_app_update`, {
      data: { device_os: 'web' },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });
});
