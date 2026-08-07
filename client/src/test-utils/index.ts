/**
 * Public entry point for the integration test harness. Import from here in
 * spec files so there's a single, discoverable surface for test utilities.
 *
 *   import { renderWithProviders, setTestUser, server } from '@/test-utils';
 */
export { renderWithProviders, createTestQueryClient } from './renderWithProviders';
export { server } from './server';
export { setTestUser, setSignedOut, resetClerkMock, getTestUser } from './clerkMock';
export type { TestUser } from './clerkMock';
