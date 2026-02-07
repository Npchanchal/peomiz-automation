# Test Fixtures

Shared fixture data for **integration**, **sanity**, and **E2E** tests.

## Fixture Files

| File | Description |
|------|-------------|
| `test-user.json` | Customer user (phone, email, otp) |
| `test-vendor.json` | Partner/vendor (phone, otp, vendor_id) |
| `test-address.json` | Delivery address (pincode, address, state, city) |
| `test-product.json` | Product/service (product_id, service_slug, sku) |
| `codeigniter-api.json` | CodeIgniter-specific (order_id, ref_id, OTPs) |
| `index.json` | Fixture manifest/index |

## Override via Environment

Any value can be overridden with env vars (see `.env.example`):

- `TEST_CUSTOMER_PHONE`, `TEST_OTP`, `TEST_CUSTOMER_EMAIL`
- `TEST_VENDOR_PHONE`, `TEST_VENDOR_OTP`, `TEST_VENDOR_ID`, `TEST_VENDOR_USER_ID`
- `TEST_PINCODE_ID`, `TEST_PINCODE`
- `TEST_PRODUCT_ID`, `SERVICE_SLUG`
- `TEST_ORDER_ID`, `EXTERNAL_ORDER_API_KEY`

## Isolation / Reset Per Run

- **Fixture JSON files**: Read-only; never modified by tests.
- **Integration (PHPUnit)**: Uses `RefreshDatabase`; DB is reset before each run.
- **Sanity / E2E**: Use unique IDs (`Date.now()`, `E2E-FULL-*`, `SANITY-*`) for orders; no shared mutable state.
- **CI**: Each workflow run uses a fresh DB (Integration) or hits staging with idempotent operations.

## Usage

**Playwright (sanity, e2e, regression):**

```ts
import { loadFixtures } from '../../support/loadFixtures';

const f = loadFixtures();
f.user.phone;   // customer phone
f.vendor.otp;   // partner OTP
f.address.pincode;
f.product.product_id;
```

**PHP (integration):**

```php
use Tests\Support\Fixtures;

$user = Fixtures::user();     // ['phone' => '9876543210', 'otp' => '1234', ...]
$vendor = Fixtures::vendor();
$address = Fixtures::address();
$product = Fixtures::product();
```
