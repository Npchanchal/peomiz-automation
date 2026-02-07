# Automation Test Suites

Test automation for **peomiz.prod** (Laravel backend), **piomiz-customer-app**, and **piomiz-vendor-app**.

## Structure

```
automation/
├── suites/
│   ├── integration/   # Orchestrates PHPUnit (tests in peomiz.prod/tests/Integration)
│   ├── sanity/       # Quick smoke tests (Playwright)
│   ├── e2e/          # End-to-end user flows (Playwright)
│   └── regression/   # Full regression (Playwright)
├── config/           # Base config (env, URLs)
├── fixtures/         # Test data (JSON) — see fixtures/README.md
├── support/          # loadFixtures, coverageFixtures, test export
├── scripts/          # run-regression.sh
├── playwright.config.ts       # Default Playwright config
├── playwright.coverage.config.ts  # Coverage runs (Chromium, monocart)
├── global.setup.ts   # Coverage cache cleanup
├── global-teardown.ts  # Coverage report generation
└── README.md
```

## Suite Types

| Suite | Purpose | Scope |
|-------|---------|-------|
| **integration** | Backend API, DB, payment gateway, external services | peomiz.prod + APIs |
| **sanity** | Quick smoke tests; critical paths only | All three projects |
| **e2e** | Full user flows (customer booking, partner accepting, etc.) | Customer app, Vendor app, Backend |
| **regression** | Full regression; all known flows | All three projects |

## Setup

```bash
cd automation
npm install
```

Copy `.env.example` to `.env` and set `BASE_URL` (default: `http://localhost:8000`).

Ensure **peomiz.prod** is running and `composer install` is done for PHPUnit.

## Usage

| Script | Command | Purpose |
|--------|---------|---------|
| Sanity | `npm run suite:sanity` | Critical-path smoke tests—**run before each deploy** (API health, customer/partner login, order creation) |
| E2E | `npm run suite:e2e` | End-to-end flows (customer, partner, full order→payout) |
| Regression | `npm run suite:regression` | **Full regression**: Integration (PHPUnit) + Sanity + E2E + regression smoke |
| Integration | `npm run suite:integration` | PHPUnit backend integration (peomiz.prod) |
| All | `npm run test:all` | Same as regression (all suites) |
| **Sanity + coverage** | `npm run suite:sanity:coverage` | Sanity tests with V8 JS/CSS coverage report |
| **E2E + coverage** | `npm run suite:e2e:coverage` | E2E tests with V8 coverage |
| **Regression + coverage** | `npm run suite:regression:coverage` | Full Playwright suite with coverage |
| **Integration + coverage** | `npm run suite:integration:coverage` | PHPUnit with PHP coverage (requires pcov/xdebug) |

### Examples

```bash
# Run sanity only
npm run suite:sanity

# Run E2E only
npm run suite:e2e

# Run full regression (Integration + Sanity + E2E)
npm run suite:regression

# CI mode (retries, junit reporter)
CI=1 npm run suite:regression

# Run PHPUnit integration tests (from peomiz.prod)
npm run suite:integration

# Run everything
npm run test:all

# Run with coverage (V8 JS/CSS, Chromium)
npm run suite:sanity:coverage
npm run suite:e2e:coverage
npm run suite:regression:coverage

# PHP integration coverage (requires pcov or xdebug)
npm run suite:integration:coverage
```

### Environment

Copy `.env.example` to `.env` and set values. Config loads via dotenv.

| Variable | Default | Description |
|----------|---------|-------------|
| `TEST_ENV` | `dev` | `dev` \| `staging` \| `prod` |
| `ENV_FILE` | `automation/.env` | Path to .env file |
| `BASE_URL` | env-specific | peomiz.prod base URL |
| `API_V1_URL` | `{BASE_URL}/api/v1` | CodeIgniter API base |
| `TEST_CUSTOMER_PHONE` | optional | Test customer phone |
| `TEST_VENDOR_PHONE` | optional | Test vendor phone |
| `TEST_CUSTOMER_USER_ID` | optional | Test customer user ID |
| `TEST_VENDOR_ID` | optional | Test vendor ID |

**Secrets:** Never commit `.env`; keep test credentials out of source control. Use env vars in CI. See `.github/workflows/README.md` for GitHub Actions secrets.

## Coverage

| Suite | Coverage type | Output |
|-------|---------------|--------|
| **Sanity, E2E, Regression** | V8 JS/CSS (Chromium) | `automation/coverage-reports/index.html` |
| **Integration** | PHP (pcov/xdebug) | `peomiz.prod/coverage-reports/` |

Playwright coverage uses [monocart-coverage-reports](https://github.com/cenfun/monocart-coverage-reports). Run `npm run suite:sanity:coverage` (or `suite:e2e:coverage`, `suite:regression:coverage`) to generate reports. Coverage is Chromium-only (V8 API).

## Docs

| Doc | Description |
|-----|--------------|
| [fixtures/README.md](fixtures/README.md) | Fixture files, env overrides, isolation |
| [suites/sanity/README.md](suites/sanity/README.md) | Sanity smoke tests |
| [suites/e2e/README.md](suites/e2e/README.md) | E2E flows (customer, partner, full) |
| [suites/integration/README.md](suites/integration/README.md) | PHPUnit integration tests |
| [suites/regression/README.md](suites/regression/README.md) | Regression suite, feature coverage |
| [../docs/AUTOMATION_TESTING.md](../docs/AUTOMATION_TESTING.md) | Automation overview (project docs) |
