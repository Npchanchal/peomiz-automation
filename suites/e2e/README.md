# E2E Test Suites

End-to-end tests for peomiz flows.

## Admin Dashboard (`admin-dashboard.spec.ts`)

All admin backend scenarios across dashboard, customer apps, and partner apps:

| Area | Scenarios |
|------|-----------|
| **Core** | Login, dashboard home, profile |
| **Customers & Complaints** | `/admin/customers`, `/admin/complaints` |
| **Bookings** | All bookings, pending payments, confirmed, assigned, completed, booking complaints |
| **Payment** | Pending, complete |
| **Partners** | Pending, approved, returned, assessment approval, vendor-details/{id} |
| **Account** | Pending, completed |
| **Services & Fulfillment** | Products, categories, states, cities, pincode |
| **Settings & Content** | Premium settings, banners, HSN & GST |
| **Admin → Customer App** | Pincode suggestions (admin-configured data flows to customer) |
| **Admin → Partner App** | CodeIgniter check_user_status (admin approval flows to partner) |

**Fixtures:** `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`, `TEST_VENDOR_ID` (for partner details)

## Partner Dashboard (`partner-dashboard.spec.ts`)

Admin backend partner management scenarios (Laravel dashboard):

1. **Admin login** – Backend login page loads; valid credentials redirect to admin
2. **Pending partners** – `/admin/partners` page loads
3. **Approved partners** – `/admin/partners/approved` page loads
4. **Returned partners** – `/admin/partners/returned` page loads
5. **Assessment approval** – `/admin/partners/assessment-approval` page loads
6. **Partner details** – `/admin/partners/vendor-details/{id}` page loads

**Fixtures:** `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`, `TEST_VENDOR_ID` (for details test)

## Partner App API (`partner-app-api.spec.ts`)

CodeIgniter API scenarios used by piomiz-vendor-app:

| Area | APIs |
|------|------|
| **Auth** | api/login, api/login_verify, api/resend_otp, api/check_user_status, api/verified_user |
| **Bookings** | api/get_order_details, api/get_booking_details, api/update_booking_list, api/get_upcoming_bookings, api/get_ongoing_bookings, api/get_completed_bookings, api/get_cancelled_bookings |
| **Service OTP** | api/generate_service_start_otp, api/generate_service_otp |
| **Dashboard** | api/get_dashboard_count, api/get_dashboard_comp_count |
| **Ledger** | api/customer_details |
| **Training** | api/get_vendor_training_video_list |
| **Assessment** | api/get_vendor_assessment_form_list |
| **Bank** | api/get_bank_details |
| **Notifications** | api/app_notification_list |
| **App** | api/check_app_update |

**Fixtures:** `TEST_VENDOR_PHONE`, `TEST_VENDOR_OTP`, `TEST_VENDOR_USER_ID`, `TEST_VENDOR_REF_ID`, `TEST_ORDER_ID`

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

## Customer Dashboard (`customer-dashboard.spec.ts`)

Admin backend customer management scenarios:

| Scenario | Description |
|---------|-------------|
| Customers page | `/admin/customers` – customer list |
| All bookings | `/admin/bookings` – customer orders |
| Pending payments | `/admin/bookings/pending-payments` |
| Confirmed bookings | `/admin/bookings/confirmed-booking` |
| Assigned bookings | `/admin/bookings/assigned-booking` |
| Completed bookings | `/admin/bookings/completed-booking` |
| Complaints | `/admin/complaints` – customer complaints |
| Booking complaints | `/admin/bookings/booking-complaints` |

**Fixtures:** `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`

## Customer (Partner App) (`customer-partner-app.spec.ts`)

Partner app API scenarios involving customer data (partner views customer info):

| Scenario | Description |
|----------|-------------|
| api/get_customer_not_available_content | Content for customer not available modal |
| api/customer_not_available | Partner reports customer not available |
| api/complaint_customer_not_available | Partner reports in complaint flow |
| api/customer_details | Customer details (partner ledger) |

**Fixtures:** `TEST_VENDOR_USER_ID`, `TEST_ORDER_ID`, `TEST_CUSTOMER_USER_ID`

## Customer App Partner (`customer-app-partner.spec.ts`)

Partner-related scenarios from the customer side (pincode/service availability, partner coverage):

| Scenario | Description |
|----------|-------------|
| Pincode suggestions | Partner coverage area lookup (POST /pincodes/suggestions) |
| Services with pincode | Services page loads with pincode cookie (partner-serviced area) |
| Homepage | Service availability entry point |
| customerApi/search_pincode_by_keyword | piomiz-customer-app pincode search |
| customerApi/get_pincode_list | piomiz-customer-app pincode list |
| External orders | Pincode serviceability (partner coverage) |
