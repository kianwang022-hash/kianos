import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/xizong-e2e',
  fullyParallel: false,
  workers: 1,
  maxFailures: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 7_500 },
  reporter: process.env.CI
    ? [['line'], ['json', { outputFile: 'test-results/xizong-results.json' }]]
    : [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4321',
    headless: true,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321/xizong/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});