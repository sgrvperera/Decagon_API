import { PlaywrightTestConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5000 },
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  projects: [
    {
      name: 'api',
      testMatch: /.*\.spec\.ts/,
    }
  ],
  use: {
    baseURL: process.env.BASE_URL || '',
    trace: 'on-first-retry'
  }
};

export default config;
