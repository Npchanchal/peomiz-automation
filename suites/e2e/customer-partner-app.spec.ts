/**
 * E2E Customer (from Partner App) – Partner app API scenarios involving customer data.
 * Covers: customer not available, customer details (ledger), customer-facing flows from partner app.
 *
 * Partner app shows customer info in bookings, complaints. These APIs support that.
 *
 * Requires: TEST_VENDOR_USER_ID for most tests. Some accept user_id.
 */
import { test, expect } from '../../support/test';
import { loadFixtures } from '../../support/loadFixtures';

const baseURL = (process.env.BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const apiV1URL = process.env.API_V1_URL || `${baseURL}/api/v1`;

test.describe('E2E Customer (Partner App) - Customer Not Available', () => {
  test.setTimeout(60000);

  test('api/get_customer_not_available_content - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    if (!userId) test.skip(true, 'Set TEST_VENDOR_USER_ID');
    const res = await request.post(`${apiV1URL}/api/get_customer_not_available_content`, {
      data: { user_id: userId },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/customer_not_available - accepts request (partner reports)', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    const orderId = f.codeigniter.order_id;
    if (!userId || !orderId) test.skip(true, 'Set TEST_VENDOR_USER_ID and TEST_ORDER_ID');
    const res = await request.post(`${apiV1URL}/api/customer_not_available`, {
      data: { user_id: userId, order_id: orderId, reason: 'E2E test probe' },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('api/complaint_customer_not_available - accepts request', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    const orderId = f.codeigniter.order_id;
    if (!userId || !orderId) test.skip(true, 'Set TEST_VENDOR_USER_ID and TEST_ORDER_ID');
    const res = await request.post(`${apiV1URL}/api/complaint_customer_not_available`, {
      data: { user_id: userId, order_id: orderId, reason: 'E2E test probe' },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe('E2E Customer (Partner App) - Customer Details', () => {
  test.setTimeout(60000);

  test('api/customer_details - accepts request (partner ledger)', async ({ request }) => {
    const f = loadFixtures();
    const userId = f.vendor.vendor_user_id;
    const customerId = f.user.user_id || '1';
    if (!userId) test.skip(true, 'Set TEST_VENDOR_USER_ID');
    const res = await request.post(`${apiV1URL}/api/customer_details`, {
      data: { user_id: userId, customer_id: customerId, date: '' },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    expect(res.status()).toBeLessThan(500);
  });
});
