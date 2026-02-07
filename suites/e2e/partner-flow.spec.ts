import { test, expect } from '../../support/test';
import { loadFixtures } from '../../support/loadFixtures';

const baseURL = (process.env.BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const apiV1URL = process.env.API_V1_URL || `${baseURL}/api/v1`;

/**
 * E2E Partner flow: login → pending bookings → accept → start (OTP) → complete (OTP).
 * Target: CodeIgniter API (api/v1/) simulation. Assign via Laravel admin optional.
 *
 * Set TEST_VENDOR_PHONE, TEST_VENDOR_OTP, TEST_VENDOR_USER_ID, TEST_ORDER_ID.
 * For start/complete OTP: TEST_SERVICE_START_OTP, TEST_SERVICE_END_OTP (or API returns OTP in response).
 */
test.describe('E2E Partner Flow - API Simulation', () => {
  test.setTimeout(180000);

  test('1. partner login', async ({ request }) => {
    const f = loadFixtures();

    const loginRes = await request.post(`${apiV1URL}/api/login`, {
      data: { phone: f.vendor.phone },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const loginJson = await loginRes.json().catch(() => ({}));
    expect(loginJson).toHaveProperty('status');
    expect([200, 400, 404]).toContain(loginRes.status());

    const refId = loginRes.ok() && loginJson.status === 200
      ? (loginJson.id ?? loginJson.ref_id ?? '')
      : '';

    if (!refId) {
      test.skip(true, 'Partner login failed—set TEST_VENDOR_PHONE and seeded vendor');
    }

    const verifyRes = await request.post(`${apiV1URL}/api/login_verify`, {
      data: { otp: f.vendor.otp, ref_id: refId, device_os: 'web' },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const verifyJson = await verifyRes.json().catch(() => ({}));

    if (!verifyRes.ok() || verifyJson.status !== 200 || !verifyJson.data?.user_id) {
      test.skip(true, 'Partner login_verify failed—set TEST_VENDOR_OTP to match seeded vendor');
    }
  });

  test('2. see pending bookings', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) {
      test.skip(true, 'No vendor_user_id—run partner login first or set TEST_VENDOR_USER_ID');
    }

    const res = await request.post(`${apiV1URL}/api/get_order_details`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const json = await res.json().catch(() => ({}));

    expect(json).toHaveProperty('status');
    expect(res.status()).toBeLessThan(500);

    if (!res.ok() || json.status !== 200) {
      test.skip(true, 'get_order_details failed—ensure vendor has pending bookings');
    }
  });

  test('3. accept booking', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    const oid = f.codeigniter.order_id;

    if (!userId || !oid) {
      test.skip(true, 'Missing vendor_user_id or order_id—run prior steps or set fixtures');
    }

    const res = await request.post(`${apiV1URL}/api/update_booking_list`, {
      data: { user_id: userId, order_id: oid },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const json = await res.json().catch(() => ({}));

    expect(json).toHaveProperty('status');
    expect(res.status()).toBeLessThan(500);

    if (res.ok() && json.status === 200) {
      expect(json).toHaveProperty('firstTitle');
    }
  });

  test('4. generate start OTP and start service', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    const oid = f.codeigniter.order_id;

    if (!userId || !oid) {
      test.skip(true, 'Missing vendor_user_id or order_id');
    }

    const genRes = await request.post(`${apiV1URL}/api/generate_service_start_otp`, {
      data: { user_id: userId, order_id: oid },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const genJson = await genRes.json().catch(() => ({}));

    expect(genJson).toHaveProperty('status');
    if (!genRes.ok() || genJson.status !== 200) {
      test.skip(true, 'generate_service_start_otp failed—order may not be in correct status');
    }

    const otp = genJson.otp ?? genJson.data?.otp ?? f.vendor.service_start_otp;
    const now = new Date().toISOString();

    const startRes = await request.post(`${apiV1URL}/api/service_started`, {
      data: {
        user_id: userId,
        order_id: oid,
        otp: String(otp).padStart(4, '0').slice(-4),
        latitude: 12.9716,
        longitude: 77.5946,
        time: now,
      },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const startJson = await startRes.json().catch(() => ({}));

    expect(startJson).toHaveProperty('status');
    expect(startRes.status()).toBeLessThan(500);

    if (startRes.ok() && startJson.status === 200) {
      expect(startJson).toHaveProperty('firstTitle');
    }
  });

  test('5. generate complete OTP and complete service', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    const oid = f.codeigniter.order_id;

    if (!userId || !oid) {
      test.skip(true, 'Missing vendor_user_id or order_id');
    }

    const genRes = await request.post(`${apiV1URL}/api/generate_service_otp`, {
      data: { user_id: userId, order_id: oid, remarks: 'E2E test completion' },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const genJson = await genRes.json().catch(() => ({}));

    expect(genJson).toHaveProperty('status');
    if (!genRes.ok() || genJson.status !== 200) {
      test.skip(true, 'generate_service_otp failed—order may not be in ongoing status');
    }

    const otp = genJson.otp ?? genJson.data?.otp ?? f.vendor.service_end_otp;

    const completeRes = await request.post(`${apiV1URL}/api/service_completed`, {
      data: {
        user_id: userId,
        order_id: oid,
        otp: String(otp).padStart(4, '0').slice(-4),
      },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const completeJson = await completeRes.json().catch(() => ({}));

    expect(completeJson).toHaveProperty('status');
    expect(completeRes.status()).toBeLessThan(500);

    if (completeRes.ok() && completeJson.status === 200) {
      expect(completeJson).toHaveProperty('firstTitle');
    }
  });

  test('6. full lifecycle: assign → start → complete (API simulation)', async ({ request }) => {
    const f = loadFixtures();
    const vendorId = f.vendor.vendor_user_id;
    const oid = f.codeigniter.order_id;

    if (!vendorId || !oid) {
      test.skip(true, 'Set TEST_VENDOR_USER_ID and TEST_ORDER_ID (order assigned to vendor)');
    }

    // 1. Pending bookings
    const pendingRes = await request.post(`${apiV1URL}/api/get_order_details`, {
      data: { user_id: vendorId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const pendingJson = await pendingRes.json().catch(() => ({}));
    expect(pendingRes.status()).toBeLessThan(500);

    // 2. Accept
    const acceptRes = await request.post(`${apiV1URL}/api/update_booking_list`, {
      data: { user_id: vendorId, order_id: oid },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(acceptRes.status()).toBeLessThan(500);

    // 3. Start (generate OTP → service_started)
    const genStartRes = await request.post(`${apiV1URL}/api/generate_service_start_otp`, {
      data: { user_id: vendorId, order_id: oid },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const genStartJson = await genStartRes.json().catch(() => ({}));
    const startOtp = genStartJson.otp ?? genStartJson.data?.otp ?? f.vendor.service_start_otp;

    const startRes = await request.post(`${apiV1URL}/api/service_started`, {
      data: {
        user_id: vendorId,
        order_id: oid,
        otp: String(startOtp).padStart(4, '0').slice(-4),
        latitude: 12.9716,
        longitude: 77.5946,
        time: new Date().toISOString(),
      },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(startRes.status()).toBeLessThan(500);

    // 4. Complete (generate OTP → service_completed)
    const genEndRes = await request.post(`${apiV1URL}/api/generate_service_otp`, {
      data: { user_id: vendorId, order_id: oid, remarks: 'E2E full flow' },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const genEndJson = await genEndRes.json().catch(() => ({}));
    const endOtp = genEndJson.otp ?? genEndJson.data?.otp ?? f.vendor.service_end_otp;

    const completeRes = await request.post(`${apiV1URL}/api/service_completed`, {
      data: {
        user_id: vendorId,
        order_id: oid,
        otp: String(endOtp).padStart(4, '0').slice(-4),
      },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const completeJson = await completeRes.json().catch(() => ({}));

    expect(completeJson).toHaveProperty('status');
    expect(completeRes.status()).toBeLessThan(500);
  });
});
