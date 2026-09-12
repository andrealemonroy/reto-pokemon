import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      command: 'npm run dev:shell',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'npm run dev:detail',
      url: 'http://localhost:3001',
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'npm run dev:history',
      url: 'http://localhost:3002',
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
