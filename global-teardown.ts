/**
 * Global teardown for coverage runs. Generates monocart report after tests.
 */
import MCR from 'monocart-coverage-reports';
import coverageOptions from './support/mcr.config';
import type { FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig) {
  if (process.env.COVERAGE === '1' || process.env.COVERAGE === 'true') {
    const mcr = MCR(coverageOptions);
    await mcr.generate();
  }
}

export default globalTeardown;
