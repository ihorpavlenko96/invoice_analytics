/**
 * Global Jest setup that runs after the test framework is installed.
 *
 * - Extends `expect` with @testing-library/jest-dom matchers.
 * - Boots the shared MSW server with the default (empty) handler set and
 *   tears it down around each test file so request handlers do not leak
 *   between suites.
 * - Resets the Clerk mock user between tests so role-specific fixtures
 *   don't bleed across suites.
 */

import '@testing-library/jest-dom';

import { server } from './server';
import { resetClerkMock } from './clerkMock';

// Start MSW once per test process. `onUnhandledRequest: 'error'` is a
// deliberate choice so a missing handler surfaces as a failing test instead
// of a silent network pass-through.
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset between tests so one test's request override cannot influence the next.
afterEach(() => {
  server.resetHandlers();
  resetClerkMock();
});

afterAll(() => {
  server.close();
});
