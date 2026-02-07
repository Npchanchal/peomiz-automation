# Regression Suite

Full regression = **Integration** (PHPUnit) + **Sanity** + **E2E** + **Regression smoke** + **Regression features**.

## Feature Coverage (per Peomiz docs: COMPREHENSIVE_ANALYSIS, FEATURES_AND_IMPLEMENTATION_REQUIREMENTS)

| Feature | regression-features.spec.ts | Real Coverage |
|---------|-----------------------------|---------------|
| **Auth** (customer/partner) | ✅ probe | Sanity, E2E |
| **Cart/checkout** | ✅ probe | E2E customer-flow |
| **Order status** | ✅ probe | E2E full-flow |
| **Payment COD** | ✅ probe | Integration, E2E, Sanity |
| **Payment Cashfree** | TODO (fixme) | None |
| **KYC approve** | TODO (fixme) | Integration |
| **KYC return** | TODO (fixme) | None |
| **Partner assignment** | TODO (fixme) | Integration, E2E full-flow |
| **Cancellation** | TODO (fixme) | Integration |
| **Payout** | TODO (fixme) | Integration, E2E full-flow |

## What Runs

| Suite        | Location                       | Runner      |
|-------------|---------------------------------|-------------|
| Integration | `peomiz.prod/tests/Integration/` | PHPUnit     |
| Sanity      | `suites/sanity/`                | Playwright  |
| E2E         | `suites/e2e/`                   | Playwright  |
| Regression  | `suites/regression/`            | Playwright  |

## Run Full Regression

```bash
cd automation
npm run suite:regression
```

Or use the runner script directly:

```bash
./scripts/run-regression.sh
```

With Playwright coverage (V8 JS/CSS):

```bash
npm run suite:regression:coverage
```

## CI

Set `CI=1` for CI mode (retries, junit reporter):

```bash
CI=1 npm run suite:regression
```

## Idempotency

- **Integration**: Uses `RefreshDatabase`; each run starts from a clean DB.
- **Sanity**: Read-only API probes; no persistent writes.
- **E2E**: Uses unique IDs (`Date.now()`, `E2E-FULL-*`); fixture-based for partner flow.
- **Regression**: Read-only smoke checks.

## Prerequisites

- Laravel (peomiz.prod) running; test DB configured
- CodeIgniter API (api/v1) if partner/E2E tests run
- `.env` in automation with BASE_URL, API_V1_URL, fixtures as needed
