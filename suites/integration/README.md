# Integration Test Suite

Integration tests **hit the database** and run against the Laravel API in `peomiz.prod`. They use **Laravel PHPUnit** with `RefreshDatabase` (test DB) or DB transactions.

## Test Location

Tests live in **`peomiz.prod/tests/Integration/`** because they require Laravel models, factories, and DB access:

| File | Coverage |
|------|----------|
| `OrderKyCPayoutIntegrationTest.php` | Order creation, KYC approval, partner assignment, payout calculation, edge cases |
| `PeomizApiIntegrationTest.php` | Health, login/OTP, COD order, partner assign, payment callback |
| `OrderApiIntegrationTest.php` | Health, API routes |

## How to Run

```bash
# From automation folder
npm run suite:integration

# Or directly from peomiz.prod
cd peomiz.prod && php vendor/bin/phpunit --testsuite=Integration

# Run specific test class
cd peomiz.prod && php vendor/bin/phpunit --filter=OrderKyCPayoutIntegrationTest

# With PHP coverage (requires pcov or xdebug)
npm run suite:integration:coverage
# Output: peomiz.prod/coverage-reports/
```

## OrderKyCPayoutIntegrationTest Coverage

### Flows
1. **Order creation** – COD order, cart cleared after placement
2. **KYC approval** – Admin approves vendor → `is_kyc=1`, `action_date` set
3. **Partner assignment** – Admin assigns vendor to order → `vendor_id`, `order_status=3`
4. **Payout calculation** – Admin adds partner payment → `PartnerPayment` created, orders marked `is_paid=1`

### Edge Cases
- **Invalid KYC** – Servicable vendor list excludes non-KYC vendors
- **Duplicate order** – Second COD submit fails with "Cart is empty"
- **Cancelled booking** – Admin cancel creates `tbl_order_cancelled`, order status 6
- **Already cancelled** – Re-cancel returns "Order is already cancelled"
- **Already assigned** – Assign again returns "This order already has an assigned partner"

## Prerequisites

- Laravel test DB configured (e.g. `.env.testing`)
- Run `php artisan migrate` for tests (or use `RefreshDatabase`)
