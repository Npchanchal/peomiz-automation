/**
 * Playwright config for coverage runs. Use with COVERAGE=1.
 * Chromium-only (V8 coverage API), global setup/teardown for monocart.
 */
import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const baseURL = process.env.BASE_URL || 'http://localhost:8000';

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  reporter:
    process.env.CI
      ? [['list'], ['junit', { outputFile: 'test-results/junit.xml' }]]
      : [['html', { open: 'never' }], ['list']],
  globalSetup: 'global.setup.ts',
  globalTeardown: 'global-teardown.ts',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  timeout: 30000,
  expect: { timeout: 10000 },
  // Chromium only – V8 coverage API is Chromium-based
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
