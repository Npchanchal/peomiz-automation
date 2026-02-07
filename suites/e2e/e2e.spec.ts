import { test, expect } from '../../support/test';

const baseURL = process.env.BASE_URL || 'http://localhost:8000';

test.describe('E2E Suite', () => {
  test('Customer flow - homepage loads', async ({ request }) => {
    const response = await request.get(baseURL);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html.length).toBeGreaterThan(100);
  });

  test('API flow - customer login endpoint accepts request', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/v1/customerapi/login`, {
      data: { phone: '9999999999' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect([200, 400]).toContain(response.status());
  });

  test('API flow - vendor login endpoint accepts request', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/v1/api/login`, {
      data: { phone: '9999999999' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect([200, 400]).toContain(response.status());
  });
});
