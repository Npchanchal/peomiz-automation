# E2E Test Suites

End-to-end tests for peomiz flows.

## Partner Flow (`partner-flow.spec.ts`)

Simulates the partner lifecycle via CodeIgniter API:

1. **Login** – Partner login (`api/login`, `api/login_verify`)
2. **See pending bookings** – `api/get_order_details`
3. **Accept booking** – `api/update_booking_list`
4. **Start service (OTP)** – `api/generate_service_start_otp` → `api/service_started`
5. **Complete service (OTP)** – `api/generate_service_otp` → `api/service_completed`

### Assign → Start → Complete Lifecycle

For full lifecycle testing:

1. **Assign** – Order must be assigned to the vendor *before* partner tests. Use:
   - Laravel admin panel: assign vendor to order
   - Or run integration tests: `OrderKyCPayoutIntegrationTest::partner_assignment_updates_order_and_vendor`
2. **Start** – Partner accepts → generates start OTP → starts service
3. **Complete** – Partner generates complete OTP → completes service

### Fixtures

Set in `automation/.env` or `automation/fixtures/codeigniter-api.json`:

| Variable | Description |
|----------|-------------|
| `TEST_VENDOR_PHONE` | Partner phone for login |
| `TEST_VENDOR_OTP` | OTP for `login_verify` (use seeded test user) |
| `TEST_VENDOR_USER_ID` | Vendor user ID from `login_verify` |
| `TEST_ORDER_ID` | Order ID (must be assigned to vendor via admin first) |
| `TEST_SERVICE_START_OTP` | OTP for `service_started` (or from API) |
| `TEST_SERVICE_END_OTP` | OTP for `service_completed` |

### Run

```bash
cd automation
npm run suite:e2e
# Or only partner flow:
npx playwright test suites/e2e/partner-flow.spec.ts --config=playwright.config.ts
# With coverage (V8 JS/CSS):
npm run suite:e2e:coverage
```

## Full Flow (`full-flow.spec.ts`)

End-to-end API simulation of the complete lifecycle:

1. **Customer creates order** – POST `/api/external/orders` (X-API-Key)
2. **Admin assigns partner** – POST `/admin/bookings/assign-servicable-vendor`
3. **Partner accepts** – CodeIgniter `api/update_booking_list`
4. **Partner starts** – `api/generate_service_start_otp` → `api/service_started`
5. **Partner completes** – `api/generate_service_otp` → `api/service_completed`
6. **Admin creates payout** – POST `/admin/payment/add-payment`
7. **Assert** – Order status = 5 (completed), payout record exists

### Fixtures (full flow)

| Variable | Description |
|----------|-------------|
| `EXTERNAL_ORDER_API_KEY` | For external orders API |
| `TEST_ADMIN_EMAIL` | Admin login email |
| `TEST_ADMIN_PASSWORD` | Admin login password |
| `TEST_VENDOR_ID` | Laravel vendors.id (= CodeIgniter vendor_user_id) |
| `TEST_VENDOR_PHONE` | Partner phone for login |
| `TEST_VENDOR_OTP` | Partner login OTP |
| `TEST_PRODUCT_ID` | Product ID for order (default: 1) |

## Customer Flow (`customer-flow.spec.ts`)

See customer flow: browse → cart → checkout → order creation.
