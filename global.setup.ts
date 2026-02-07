/**
 * Global setup for coverage runs. Cleans monocart cache before tests.
 */
import MCR from 'monocart-coverage-reports';
import coverageOptions from './support/mcr.config';
import type { FullConfig } from '@playwright/test';

async function globalSetup(_config: FullConfig) {
  if (process.env.COVERAGE === '1' || process.env.COVERAGE === 'true') {
    const mcr = MCR(coverageOptions);
    await mcr.cleanCache();
  }
}

export default globalSetup;
