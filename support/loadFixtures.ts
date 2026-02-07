/**
 * Shared fixture loader. Reads JSON from automation/fixtures/ and merges with env vars.
 * Fixtures are read-only; tests use unique IDs (Date.now()) for isolation per run.
 *
 * Usage:
 *   import { loadFixtures } from '../support/loadFixtures';
 *   const f = loadFixtures();
 *   f.user.phone, f.vendor.otp, f.address.pincode, f.product.product_id
 */
import * as fs from 'fs';
import * as path from 'path';

export interface Fixtures {
  user: {
    phone: string;
    email: string;
    name: string;
    otp: string;
    user_id: string;
  };
  vendor: {
    phone: string;
    otp: string;
    vendor_id: string;
    vendor_user_id: string;
    ref_id: string;
    service_start_otp: string;
    service_end_otp: string;
  };
  address: {
    pincode: string;
    pincode_id: string;
    address: string;
    state: string;
    city: string;
  };
  product: {
    product_id: string;
    service_slug: string;
    quantity: number;
  };
  codeigniter: {
    order_id: string;
  };
}

function loadJson<T>(filePath: string, defaults: T): T {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function loadFixtures(): Fixtures {
  const base = path.resolve(__dirname, '../fixtures');
  const user = loadJson(path.join(base, 'test-user.json'), {
    phone: '9876543210',
    email: 'test-customer@peomiz.test',
    name: 'Test Customer',
    otp: '1234',
    user_id: '',
  });
  const vendor = loadJson(path.join(base, 'test-vendor.json'), {
    phone: '9999999998',
    otp: '1234',
    vendor_id: '',
    vendor_user_id: '',
    ref_id: '',
    service_start_otp: '1234',
    service_end_otp: '1234',
  });
  const address = loadJson(path.join(base, 'test-address.json'), {
    pincode: '560001',
    pincode_id: '1',
    address: '123 Test St',
    state: 'Karnataka',
    city: 'Bangalore',
  });
  const product = loadJson(path.join(base, 'test-product.json'), {
    product_id: '1',
    service_slug: 'carpenter-9jtmt',
    quantity: 1,
  });
  const codeigniter = loadJson(path.join(base, 'codeigniter-api.json'), {
    order_id: '',
  });

  return {
    user: {
      phone: process.env.TEST_CUSTOMER_PHONE || user.phone,
      email: process.env.TEST_CUSTOMER_EMAIL || user.email,
      name: process.env.TEST_CUSTOMER_NAME || user.name,
      otp: process.env.TEST_OTP || user.otp,
      user_id: process.env.TEST_CUSTOMER_USER_ID || user.user_id,
    },
    vendor: {
      phone: process.env.TEST_VENDOR_PHONE || vendor.phone,
      otp: process.env.TEST_VENDOR_OTP || vendor.otp,
      vendor_id: process.env.TEST_VENDOR_ID || vendor.vendor_id,
      vendor_user_id: process.env.TEST_VENDOR_USER_ID || vendor.vendor_user_id,
      ref_id: process.env.TEST_VENDOR_REF_ID || vendor.ref_id,
      service_start_otp: process.env.TEST_SERVICE_START_OTP || vendor.service_start_otp,
      service_end_otp: process.env.TEST_SERVICE_END_OTP || vendor.service_end_otp,
    },
    address: {
      pincode: process.env.TEST_PINCODE || address.pincode,
      pincode_id: process.env.TEST_PINCODE_ID || address.pincode_id,
      address: process.env.TEST_ADDRESS || address.address,
      state: address.state,
      city: address.city,
    },
    product: {
      product_id: process.env.TEST_PRODUCT_ID || product.product_id,
      service_slug: process.env.SERVICE_SLUG || product.service_slug,
      quantity: product.quantity ?? 1,
    },
    codeigniter: {
      order_id: process.env.TEST_ORDER_ID || codeigniter.order_id,
    },
  };
}
