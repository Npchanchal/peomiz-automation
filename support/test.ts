/**
 * Unified test export. Use COVERAGE=1 to enable V8 coverage collection.
 * Specs import from here instead of @playwright/test for coverage support.
 */
import { test as baseTest, expect as baseExpect } from '@playwright/test';
import { test as coverageTest, expect as coverageExpect } from './coverageFixtures';

const useCoverage = process.env.COVERAGE === '1' || process.env.COVERAGE === 'true';

export const test = useCoverage ? coverageTest : baseTest;
export const expect = useCoverage ? coverageExpect : baseExpect;
