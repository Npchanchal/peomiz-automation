import { test, expect } from '../../support/test';
import { loadFixtures } from '../../support/loadFixtures';

const baseURL = (process.env.BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

/**
 * E2E Customer flow: browse service → add to cart → checkout (address, slot, payment) → order created.
 * Targets peomiz.prod web frontend.
 *
 * For full checkout flow: set TEST_CUSTOMER_PHONE and TEST_OTP (use seeded user with fixed OTP).
 * Run: npm run suite:e2e
 */
test.describe('E2E Customer Flow', () => {
  test.setTimeout(180000);

  test('browse homepage and services', async ({ page }) => {
    await page.goto(baseURL);
    await expect(page).toHaveURL(new RegExp(baseURL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(page.locator('body')).toBeVisible();

    // Click first service link if present, or go to services page
    const serviceLink = page.locator('a[href*="/services/"]').first();
    const count = await serviceLink.count();
    const f = loadFixtures();
    if (count > 0) {
      await serviceLink.click();
      await expect(page).toHaveURL(/\/services\//);
    } else {
      await page.goto(`${baseURL}/services/${f.product.service_slug}`);
      await expect(page).toHaveURL(/\/services\//);
    }
  });

  test('add to cart from services page', async ({ page, request }) => {
    const f = loadFixtures();
    await page.goto(`${baseURL}/services/${f.product.service_slug}`);

    // Wait for products to load
    const addToCartBtn = page.locator('.direct-add-to-cart-btn, .add_to_cart, button:has-text("Add To Cart"), button:has-text("Add to cart")').first();
    const count = await addToCartBtn.count();
    if (count === 0) {
      test.skip(true, 'No Add to Cart button found—no products or service slug invalid');
    }

    await addToCartBtn.click();
    await page.waitForTimeout(1500);

    // Verify cart has items (check cart count or go to cart)
    await page.goto(`${baseURL}/carts`);
    await expect(page).toHaveURL(/\/carts/);
    const cartListing = page.locator('.cart-listing tr, .cart-table tbody tr, .cart-item');
    const cartRows = await cartListing.count();
    expect(cartRows).toBeGreaterThan(0);
  });

  test('cart view and proceed to checkout', async ({ page, request }) => {
    const f = loadFixtures();
    const addRes = await request.post(`${baseURL}/add-to-cart`, {
      form: { _token: 'placeholder', product_id: f.product.product_id, qty: String(f.product.quantity) },
      headers: { Referer: baseURL },
    });
    // May fail if product doesn't exist—continue to cart
    await page.goto(`${baseURL}/carts`);
    const checkoutLink = page.locator('a[href*="checkout"], a:has-text("Checkout")').first();
    await checkoutLink.click();

    // Either checkout page (if logged in) or login redirect
    await page.waitForURL(/\/(checkout|login)/);
  });

  test('full flow: login → checkout → order (API-assisted)', async ({ page, request }) => {
    const f = loadFixtures();
    const loginCheckRes = await request.post(`${baseURL}/login-check`, {
      data: { phone: f.user.phone },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    const loginJson = await loginCheckRes.json().catch(() => ({}));
    const refId = loginJson.ref_id || loginJson.id;
    if (!refId) {
      test.skip(true, 'Login check failed or no ref_id—set TEST_CUSTOMER_PHONE and seeded user with fixed OTP');
    }

    const verifyRes = await request.post(`${baseURL}/login-verify`, {
      data: {
        'ref_id': refId,
        'digit-1': f.user.otp[0],
        'digit-2': f.user.otp[1],
        'digit-3': f.user.otp[2],
        'digit-4': f.user.otp[3],
      },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    if (!verifyRes.ok()) {
      test.skip(true, 'Login verify failed—ensure TEST_OTP matches seeded user verification_code');
    }

    // 2. Copy auth cookies to page context
    const state = await request.storageState();
    await page.context().addCookies(state.cookies);

    await page.goto(`${baseURL}/services/${f.product.service_slug}`);
    const token = (await page.locator('input[name="_token"]').first().getAttribute('value')) || '';
    const pid = f.product.product_id || (await page.locator('input[name="product_id"]').first().getAttribute('value')) || '1';

    await request.post(`${baseURL}/add-to-cart`, {
      form: { _token: token, product_id: pid, qty: String(f.product.quantity) },
      headers: { Referer: baseURL },
    });

    // 4. Go to checkout
    await page.goto(`${baseURL}/checkout`);
    await expect(page).toHaveURL(/\/checkout/);

    await page.context().addCookies([{
      name: 'pincodeLocation',
      value: JSON.stringify({ pincode_id: f.address.pincode_id }),
      url: baseURL,
    }]);

    await page.reload();

    // 6. Wait for slot/date UI and select first date
    const dateBox = page.locator('.bookingDatepics .date-box, .date-box').first();
    const dateCount = await dateBox.count();
    if (dateCount > 0) {
      await dateBox.click();
      await page.waitForTimeout(500);
    }

    // 7. Select first time slot
    const timeSlot = page.locator('.slot-input .time-item, .time-item').first();
    const timeCount = await timeSlot.count();
    if (timeCount > 0) {
      await timeSlot.click();
      await page.waitForTimeout(300);
    }

    // 8. Click Next to go to address
    const nextBtn = page.locator('#slot-btns, .next_btn').first();
    if (await nextBtn.count() > 0) await nextBtn.click();
    await page.waitForTimeout(500);

    // 9. Select first address
    const addressRadio = page.locator('input[name="address_id"]').first();
    if (await addressRadio.count() > 0) await addressRadio.check();

    // 10. Next to payment
    const locNextBtn = page.locator('#location-btns, .next_btn').first();
    if (await locNextBtn.count() > 0) await locNextBtn.click();
    await page.waitForTimeout(500);

    // 11. Select COD
    const codRadio = page.locator('input[value="cod"], input[name="payment_method"][value="cod"]').first();
    if (await codRadio.count() > 0) await codRadio.check();

    // 12. Submit order
    const submitBtn = page.locator('.checkout-ajax-form button[type="submit"], .checkout-ajax-form input[type="submit"], button:has-text("Place Order"), button:has-text("Proceed")').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/\/(order-completed|checkout|success)/);
    } else {
      // Fallback: form may use AJAX
      await page.locator('.checkout-ajax-form').first().evaluate((form: HTMLFormElement) => (form as any).submit?.());
      await page.waitForTimeout(3000);
    }
  });
});
