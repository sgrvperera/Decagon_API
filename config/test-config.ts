import * as dotenv from 'dotenv';
import * as path from 'path';

const env = process.env.TEST_ENV || 'dev';
dotenv.config({ path: path.resolve(__dirname, `environments/${env}.env`) });

export const config = {
  baseURL: process.env.BASE_URL || 'https://chatbot.dialog.lk',
  traceId: process.env.TRACE_ID || 'AUTO_TEST_TRACE',
  timeout: parseInt(process.env.API_TIMEOUT || '15000'),
  retries: parseInt(process.env.RETRIES || '1'),
  mockMode: process.env.MOCK_API === 'true',
  env: env
};
