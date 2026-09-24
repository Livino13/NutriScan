import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  reporter: 'line',
  timeout: 90000,
  use: {
    baseURL: 'http://localhost:8445',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: 'PORT=8445 pnpm dev',
    url: 'http://localhost:8445',
    reuseExistingServer: false,
    timeout: 90000,
  },
});
