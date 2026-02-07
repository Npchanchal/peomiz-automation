/**
 * Regression suite – smoke tests run as part of the full regression.
 * Full regression = Integration (PHPUnit) + Sanity + E2E + this file.
 *
 * Tests here are quick smoke checks. Sanity and E2E provide deeper coverage.
 * Idempotent: read-only or use unique IDs (Date.now()).
 * CI-ready: forbidOnly, retries in playwright.config.
 */
import { test, expect } from '../../support/test';

const baseURL = (process.env.BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

test.describe('Regression Suite - Smoke', () => {
  test.setTimeout(60000);

  test('app root responds', async ({ request }) => {
    const response = await request.get(baseURL);
    expect(response.ok()).toBeTruthy();
  });

  test('API v1 base responds', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/v1`);
    expect(response.status()).toBeLessThan(500);
  });
});
