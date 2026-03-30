import { PlaywrightTestConfig } from '@playwright/test';
import { config as testConfig } from './config/test-config';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10000 },
  retries: process.env.CI ? 2 : testConfig.retries,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  projects: [
    {
      name: 'smoke',
      testMatch: /.*\.spec\.ts/,
      grep: /@smoke/,
    },
    {
      name: 'regression',
      testMatch: /.*\.spec\.ts/,
      grep: /@regression/,
    },
    {
      name: 'negative',
      testMatch: /.*\.spec\.ts/,
      grep: /@negative/,
    },
    {
      name: 'all',
      testMatch: /.*\.spec\.ts/,
    }
  ],
  use: {
    baseURL: testConfig.baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  }
};

export default config;
