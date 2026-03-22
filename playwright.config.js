import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 15_000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:8788',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: 'wrangler pages dev .',
    port: 8788,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
