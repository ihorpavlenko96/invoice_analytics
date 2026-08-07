/**
 * Playwright configuration for E2E tests.
 *
 * Tests are located in client/e2e/ and follow the *.spec.ts naming convention.
 * The Vite dev server is started automatically before the test run.
 *
 * Run tests with:
 *   cd client && npm run test:e2e
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Directory containing the E2E test files
  testDir: './e2e',

  // Run tests sequentially to avoid React Query cache conflicts between tests
  fullyParallel: false,

  // Retry once on CI to handle flaky network intercepts
  retries: process.env.CI ? 1 : 0,

  // Single worker to keep test isolation simple
  workers: 1,

  // Global timeout per test
  timeout: 30_000,

  // Reporter: show list in CI, use html reporter locally
  reporter: process.env.CI ? 'list' : [['html', { open: 'never' }]],

  use: {
    // Base URL — the Vite dev server
    baseURL: 'http://localhost:3000',

    // Run headless in all environments
    headless: true,

    // Capture screenshot on test failure for easier debugging
    screenshot: 'only-on-failure',

    // Retain video on failure
    video: 'retain-on-failure',

    // Collect traces for failed tests (viewable with `npx playwright show-trace`)
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /**
   * Automatically start the Vite dev server before running tests.
   * The server is reused when running locally to speed up the test cycle.
   * On CI a fresh server is always started.
   */
  webServer: {
    command: 'npm run dev -- --mode test',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
