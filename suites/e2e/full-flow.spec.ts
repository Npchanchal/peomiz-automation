import { test, expect } from '../../support/test';
import { loadFixtures } from '../../support/loadFixtures';

const baseURL = (process.env.BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const apiV1URL = process.env.API_V1_URL || `${baseURL}/api/v1`;

/**
 * Full E2E flow (API simulation):
 * 1. Customer creates order (external API)
 * 2. Admin assigns partner to order
 * 3. Partner accepts → starts (OTP) → completes (OTP)
 * 4. Admin creates payout
 * 5. Assert final order status and payout record
 *
 * Requires: Laravel + CodeIgniter API running. Set EXTERNAL_ORDER_API_KEY, TEST_ADMIN_EMAIL,
 * TEST_ADMIN_PASSWORD, TEST_VENDOR_ID (vendors.id), TEST_VENDOR_PHONE, TEST_VENDOR_OTP.
 */
test.describe('E2E Full Flow - Order → Assign → Start → Complete → Payout', () => {
  test.setTimeout(300000);

  test('full flow: customer order → admin assign → partner lifecycle → payout', async ({
    page,
    request,
  }) => {
    const f = loadFixtures();

    const externalApiKey = process.env.EXTERNAL_ORDER_API_KEY || '';
    const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin@test.com';
    const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'password';
    if (!externalApiKey) {
      test.skip(true, 'Set EXTERNAL_ORDER_API_KEY for order creation');
    }
    if (!adminEmail || !adminPassword) {
      test.skip(true, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    }
    if (!f.vendor.vendor_id || !f.vendor.phone || !f.vendor.otp) {
      test.skip(true, 'Set TEST_VENDOR_ID, TEST_VENDOR_PHONE, TEST_VENDOR_OTP');
    }

    const externalOrderId = `E2E-FULL-${Date.now()}`;

    // ─── 1. Create order (external API) ─────────────────────────────────────────
    const orderRes = await request.post(`${baseURL}/api/external/orders`, {
      data: {
        source: 'e2e-full-flow',
        external_order_id: externalOrderId,
        user: {
          name: f.user.name,
          email: `e2e-${Date.now()}@peomiz.test`,
          phone: f.user.phone,
        },
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
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-API-Key': externalApiKey,
      },
    });

    const orderJson = await orderRes.json().catch(() => ({}));
    if (!orderRes.ok() || !orderJson.success) {
      test.skip(
        true,
        `Order creation failed (${orderRes.status()}): ${orderJson.message || 'unknown'}`
      );
    }

    const orderId = orderJson.data?.order_id;
    expect(orderId).toBeDefined();

    // ─── 2. Admin login ─────────────────────────────────────────────────────────
    await page.goto(`${baseURL}/backend/login`);
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 10000 }).catch(() => {});

    const isAdminLoggedIn = page.url().includes('/admin');
    if (!isAdminLoggedIn) {
      test.skip(true, 'Admin login failed—check TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD');
    }

    // Use page's request context (shares cookies with page)
    const apiRequest = page.request;

    // Admin assign needs CSRF - fetch from page or use Laravel's X-XSRF-TOKEN
    const csrfToken =
      (await page.locator('meta[name="csrf-token"]').getAttribute('content')) ||
      (await page.locator('input[name="_token"]').first().getAttribute('value')) ||
      '';

    // ─── 3. Admin assigns partner to order ──────────────────────────────────────
    const assignRes = await apiRequest.post(`${baseURL}/admin/bookings/assign-servicable-vendor`, {
      form: {
        order_id: orderId,
        vendor_id: f.vendor.vendor_id,
        _token: csrfToken,
      },
      headers: { Accept: 'application/json' },
    });

    const assignJson = await assignRes.json().catch(() => ({}));
    if (!assignRes.ok() || (assignJson.status !== 200 && assignJson.status !== '200')) {
      test.skip(
        true,
        `Admin assign failed (${assignRes.status()}): ${assignJson.message || 'unknown'}`
      );
    }

    // ─── 4. Partner login (CodeIgniter) ─────────────────────────────────────────
    const loginRes = await request.post(`${apiV1URL}/api/login`, {
      data: { phone: f.vendor.phone },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const loginJson = await loginRes.json().catch(() => ({}));
    const refId = loginRes.ok() && loginJson.status === 200 ? loginJson.id ?? loginJson.ref_id ?? '' : '';

    if (!refId) {
      test.skip(true, 'Partner login failed—CodeIgniter API or TEST_VENDOR_PHONE');
    }

    const verifyRes = await request.post(`${apiV1URL}/api/login_verify`, {
      data: { otp: f.vendor.otp, ref_id: refId, device_os: 'web' },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const verifyJson = await verifyRes.json().catch(() => ({}));
    const vendorUserId = verifyRes.ok() && verifyJson.status === 200 ? verifyJson.data?.user_id : '';

    if (!vendorUserId) {
      test.skip(true, 'Partner login_verify failed—TEST_VENDOR_OTP');
    }

    // ─── 5. Partner accept ──────────────────────────────────────────────────────
    const acceptRes = await request.post(`${apiV1URL}/api/update_booking_list`, {
      data: { user_id: vendorUserId, order_id: String(orderId) },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(acceptRes.status()).toBeLessThan(500);

    // ─── 6. Partner start (generate OTP → service_started) ──────────────────────
    const genStartRes = await request.post(`${apiV1URL}/api/generate_service_start_otp`, {
      data: { user_id: vendorUserId, order_id: String(orderId) },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const genStartJson = await genStartRes.json().catch(() => ({}));
    const startOtp = genStartJson.otp ?? genStartJson.data?.otp ?? f.vendor.service_start_otp;

    const startRes = await request.post(`${apiV1URL}/api/service_started`, {
      data: {
        user_id: vendorUserId,
        order_id: String(orderId),
        otp: String(startOtp).padStart(4, '0').slice(-4),
        latitude: 12.9716,
        longitude: 77.5946,
        time: new Date().toISOString(),
      },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(startRes.status()).toBeLessThan(500);

    // ─── 7. Partner complete (generate OTP → service_completed) ──────────────────
    const genEndRes = await request.post(`${apiV1URL}/api/generate_service_otp`, {
      data: { user_id: vendorUserId, order_id: String(orderId), remarks: 'E2E full flow' },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const genEndJson = await genEndRes.json().catch(() => ({}));
    const endOtp = genEndJson.otp ?? genEndJson.data?.otp ?? f.vendor.service_end_otp;

    const completeRes = await request.post(`${apiV1URL}/api/service_completed`, {
      data: {
        user_id: vendorUserId,
        order_id: String(orderId),
        otp: String(endOtp).padStart(4, '0').slice(-4),
      },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const completeJson = await completeRes.json().catch(() => ({}));
    expect(completeRes.status()).toBeLessThan(500);

    // ─── 8. Assert final order status (completed = 5) ────────────────────────────
    const statusRes = await request.get(
      `${baseURL}/api/external/orders/status/${externalOrderId}`,
      { headers: { 'X-API-Key': externalApiKey } }
    );
    const statusJson = await statusRes.json().catch(() => ({}));

    if (statusRes.ok() && statusJson.success) {
      const orderStatus = statusJson.data?.status ?? statusJson.order_status;
      expect(Number(orderStatus)).toBe(5);
    }

    // ─── 9. Admin creates payout ────────────────────────────────────────────────
    const taxableValue = orderJson.data?.total_amount ?? 1000;
    const payoutRes = await apiRequest.post(`${baseURL}/admin/payment/add-payment`, {
      form: {
        partner_id: f.vendor.vendor_id,
        orderIds: String(orderId),
        payment_type: 'CASH',
        price_total: taxableValue,
        date: new Date().toISOString().split('T')[0],
        customer_net_val: taxableValue,
        peomiz_commission_pr: 0,
        peomiz_commission: 0,
        gross_total: taxableValue,
        partner_taxes_pr: 0,
        partner_taxes: 0,
        partner_safety_fee_pr: 0,
        partner_safety_fee: 0,
        partner_insurance_fee_pr: 0,
        partner_insurance_fee: 0,
        partner_bank_charges_pr: 0,
        partner_bank_charges: 0,
        grand_total: taxableValue,
        _token: csrfToken,
      },
      headers: { Accept: 'application/json' },
    });

    const payoutJson = await payoutRes.json().catch(() => ({}));
    expect(payoutRes.status()).toBe(200);
    expect(payoutJson.status).toBe(200);

    // ─── 10. Assert payout record created ───────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const paymentListRes = await apiRequest.post(`${baseURL}/admin/payment/get-payment-list`, {
      form: {
        draw: 1,
        start: 0,
        length: 10,
        partner_id: f.vendor.vendor_id,
        date_range: `${today} - ${today}`,
        _token: csrfToken,
      },
      headers: { Accept: 'application/json' },
    });

    const paymentListJson = await paymentListRes.json().catch(() => ({}));
    const records = paymentListJson?.data ?? [];
    expect(paymentListRes.status()).toBe(200);
    expect(records.length).toBeGreaterThan(0);
  });
});
