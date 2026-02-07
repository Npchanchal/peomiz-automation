/**
 * Monocart coverage reports config.
 * Used when COVERAGE=1 to collect V8 JS/CSS coverage from Chromium during Playwright tests.
 */
import type { CoverageReportOptions } from 'monocart-coverage-reports';

const coverageOptions: CoverageReportOptions = {
  name: 'Peomiz Playwright Coverage',
  outputDir: './coverage-reports',
  reports: ['console-summary', 'v8', 'html', 'lcovonly'],
  // Exclude third-party and node_modules
  entryFilter: (entry) => !entry.url.includes('node_modules'),
  sourceFilter: (sourcePath) => !sourcePath.includes('node_modules'),
};

export default coverageOptions;
