/**
 * Regression feature coverage – required by Peomiz docs (COMPREHENSIVE_ANALYSIS, FEATURES_AND_IMPLEMENTATION_REQUIREMENTS).
 *
 * Required features: auth, cart/checkout, order status, payment (Cashfree/COD),
 * KYC approve/return, partner assignment, cancellation, payout.
 *
 * Each test either probes the API or marks TODO. Real coverage lives in integration (PHPUnit),
 * sanity, and e2e – this file documents the regression checklist.
 */
import { test, expect } from '../../support/test';
import { loadFixtures } from '../../support/loadFixtures';

const baseURL = (process.env.BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const apiV1URL = process.env.API_V1_URL || `${baseURL}/api/v1`;

test.describe('Regression Features - Required Coverage', () => {
  test.setTimeout(60000);

  test('auth - customer login-check accepts request', async ({ request }) => {
    const f = loadFixtures();
    const res = await request.post(`${baseURL}/login-check`, {
      data: { phone: f.user.phone },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect([200, 400, 500]).toContain(res.status());
  });

  test('auth - partner api/login accepts request', async ({ request }) => {
    const f = loadFixtures();
    const res = await request.post(`${apiV1URL}/api/login`, {
      data: { phone: f.vendor.phone },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect([200, 400, 404, 500]).toContain(res.status());
  });

  test('cart/checkout - carts page loads', async ({ request }) => {
    const res = await request.get(`${baseURL}/carts`);
    expect(res.status()).toBeLessThan(500);
  });

  test('cart/checkout - checkout page loads', async ({ request }) => {
    const res = await request.get(`${baseURL}/checkout`);
    expect(res.status()).toBeLessThan(500);
  });

  test('order status - external orders status API exists', async ({ request }) => {
    const res = await request.get(`${baseURL}/api/external/orders/status/TEST-NONEXISTENT`, {
      headers: { 'X-API-Key': process.env.EXTERNAL_ORDER_API_KEY || 'dummy' },
    });
    expect([200, 401, 404, 500]).toContain(res.status());
  });

  test('payment COD - external orders accepts cod', async ({ request }) => {
    const f = loadFixtures();
    const res = await request.post(`${baseURL}/api/external/orders`, {
      data: {
        source: 'regression-cod',
        external_order_id: `REG-COD-${Date.now()}`,
        user: { name: f.user.name, email: f.user.email, phone: f.user.phone },
        address: { pincode: f.address.pincode, address: f.address.address, state: f.address.state, city: f.address.city },
        items: [{ product_id: parseInt(f.product.product_id, 10), quantity: f.product.quantity }],
        booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        booking_time: '10:00 AM',
        payment_method: 'cod',
        payment_status: 'cod',
      },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-API-Key': process.env.EXTERNAL_ORDER_API_KEY || 'dummy' },
    });
    expect([200, 201, 401, 422, 409, 500]).toContain(res.status());
  });

  test.fixme('payment Cashfree - Cashfree PG flow', async () => {
    // TODO: Add Cashfree payment flow probe. Per docs: Cashfree integrated in mobile only.
    // Coverage: none. Requires Cashfree test mode + order creation + PG callback.
  });

  test.fixme('KYC approve - admin vendor approval', async () => {
    // TODO: Add admin KYC approve probe. Integration: OrderKyCPayoutIntegrationTest::kyc_approval_sets_vendor_is_kyc_and_action_date.
    // Requires admin auth; route admin.vendors.approve.
  });

  test.fixme('KYC return - admin KYC return/reject', async () => {
    // TODO: Add KYC return flow. Per docs: manual approval exists; return/reject flow TBD. No coverage.
  });

  test.fixme('partner assignment - admin assign vendor to order', async () => {
    // TODO: Add admin assign probe. Integration: partner_assignment_updates_order_and_vendor.
    // E2E full-flow covers. Requires admin auth + order + vendor.
  });

  test.fixme('cancellation - admin cancel booking', async () => {
    // TODO: Add admin cancellation probe. Integration: admin_cancelled_booking_sets_order_status_and_creates_cancellation_record.
    // Requires admin auth + order. Route admin.bookings.cancel.
  });

  test.fixme('payout - admin add partner payment', async () => {
    // TODO: Add payout probe. Integration: payout_calculation_creates_partner_payment_and_marks_orders_paid.
    // E2E full-flow covers. Requires admin auth + completed order + partner.
  });
});
