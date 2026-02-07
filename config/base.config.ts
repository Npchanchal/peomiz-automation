/**
 * Base config for automation tests.
 * Loads from .env via dotenv. Supports dev/staging/prod via TEST_ENV.
 *
 * Environment variables:
 *   TEST_ENV       - dev | staging | prod (default: dev)
 *   ENV_FILE       - path to .env file (default: automation/.env)
 *   BASE_URL       - peomiz.prod base URL
 *   API_V1_URL     - CodeIgniter API base (default: {BASE_URL}/api/v1)
 *   TEST_CUSTOMER_PHONE - optional test customer phone
 *   TEST_VENDOR_PHONE   - optional test vendor phone
 *   TEST_CUSTOMER_USER_ID - optional test customer user ID
 *   TEST_VENDOR_ID      - optional test vendor ID
 */
import * as path from 'path';
import * as dotenv from 'dotenv';

const envFile = process.env.ENV_FILE || path.resolve(__dirname, '../.env');
dotenv.config({ path: envFile });

export type Env = 'dev' | 'staging' | 'prod';

const env = (process.env.TEST_ENV || 'dev') as Env;

const baseURL = process.env.BASE_URL || (env === 'dev' ? 'http://localhost:8000' : env === 'staging' ? 'https://staging.peomiz.com' : 'https://peomiz.com');
const apiV1URL = process.env.API_V1_URL || `${baseURL}/api/v1`;

export const config = {
  env,
  baseURL,
  apiV1URL,
  testCustomerPhone: process.env.TEST_CUSTOMER_PHONE || (env === 'dev' ? '9999999999' : undefined),
  testVendorPhone: process.env.TEST_VENDOR_PHONE || (env === 'dev' ? '9999999998' : undefined),
  testCustomerUserId: process.env.TEST_CUSTOMER_USER_ID,
  testVendorId: process.env.TEST_VENDOR_ID,
};
