# Sanity Test Suite

Quick smoke tests for critical paths. Run **before each deploy**.

## Scope

| Test | Description |
|------|-------------|
| 1. API health | App root responds |
| 2. Customer signup/login | `login-check` accepts request |
| 3. Partner signup/login | `api/login` accepts request |
| 4. Order creation | External orders API responds |
| api/login_verify | CodeIgniter mobile API returns expected JSON |
| api/get_booking_details | Returns expected JSON shape |
| api/update_booking_list | Returns expected JSON shape |

## Run

```bash
cd automation
npm run suite:sanity

# With coverage (V8 JS/CSS)
npm run suite:sanity:coverage
```

## Fixtures

Uses `automation/fixtures/` — see [fixtures/README.md](../../fixtures/README.md). Set `TEST_CUSTOMER_PHONE`, `TEST_VENDOR_PHONE`, `TEST_PRODUCT_ID`, `EXTERNAL_ORDER_API_KEY` for full coverage.
