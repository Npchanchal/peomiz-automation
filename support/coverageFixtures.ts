/**
 * Playwright test fixtures with V8 coverage collection.
 * Used when COVERAGE=1. Chromium-only (V8 coverage API).
 */
import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import MCR from 'monocart-coverage-reports';
import coverageOptions from './mcr.config';

const test = base.extend<{ _coverageCollector: void }>({
  _coverageCollector: [
    async ({ context }, use) => {
      const isChromium = test.info().project.name === 'chromium';

      const handlePageEvent = async (page: Page) => {
        try {
          await Promise.all([
            page.coverage.startJSCoverage({ resetOnNavigation: false }),
            page.coverage.startCSSCoverage({ resetOnNavigation: false }),
          ]);
        } catch {
          // coverage API is Chromium-only
        }
      };

      if (isChromium) {
        context.on('page', handlePageEvent);
      }

      await use(undefined);

      if (isChromium) {
        context.off('page', handlePageEvent);
        const coverageList = await Promise.all(
          context.pages().map(async (page) => {
            const jsCoverage = await page.coverage.stopJSCoverage();
            const cssCoverage = await page.coverage.stopCSSCoverage();
            return [...jsCoverage, ...cssCoverage];
          })
        );
        const mcr = MCR(coverageOptions);
        await mcr.add(coverageList.flat());
      }
    },
    { scope: 'test', auto: true },
  ],
});

export { test, expect };
