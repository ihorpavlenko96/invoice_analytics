/**
 * Centralised mock for `@clerk/clerk-react`.
 *
 * The real SDK performs network calls, reads window state, and otherwise
 * misbehaves inside jsdom. We swap it out with a lightweight stub whose
 * returned user/roles can be reconfigured per-test via `setTestUser(...)`.
 *
 * Usage (from a spec file):
 *
 *   import { setTestUser } from '@/test-utils/clerkMock';
 *   setTestUser({ roles: ['Super Admin'] });
 *
 * The `jest.mock` call lives at module scope. Because this file is loaded
 * via `setupTests.ts` (which Jest runs before any test file), the mock is
 * registered before any spec imports `@clerk/clerk-react`, so every test
 * gets the stub. Tests can further refine the current user via
 * `setTestUser(...)` without having to re-declare the mock.
 */
import React from 'react';

export interface TestUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string;
  roles: string[];
  /** Arbitrary additional public metadata fields merged into the mock user. */
  publicMetadata?: Record<string, unknown>;
}

const DEFAULT_USER: TestUser = {
  id: 'user_test_default',
  firstName: 'Test',
  lastName: 'User',
  emailAddress: 'test.user@example.com',
  roles: [],
  publicMetadata: {},
};

// Mutable state so individual tests can override the "current" user without
// having to re-issue `jest.mock` each time.
let currentUser: TestUser = { ...DEFAULT_USER };
let signedIn = true;

/** Override the mock Clerk user for the duration of a single test. */
export const setTestUser = (overrides: Partial<TestUser>): void => {
  currentUser = { ...DEFAULT_USER, ...currentUser, ...overrides };
  signedIn = true;
};

/** Simulate a signed-out user. */
export const setSignedOut = (): void => {
  signedIn = false;
};

/** Restore defaults — invoked from `setupTests.ts`'s `afterEach`. */
export const resetClerkMock = (): void => {
  currentUser = { ...DEFAULT_USER };
  signedIn = true;
};

/** Read the active mock user (exposed for assertions / debugging). */
export const getTestUser = (): TestUser => currentUser;

const buildClerkUser = () => ({
  id: currentUser.id,
  firstName: currentUser.firstName,
  lastName: currentUser.lastName,
  primaryEmailAddress: { emailAddress: currentUser.emailAddress },
  emailAddresses: [{ emailAddress: currentUser.emailAddress }],
  publicMetadata: {
    roles: currentUser.roles,
    ...(currentUser.publicMetadata ?? {}),
  },
});

// Installing the mock. Because this module is imported by
// `setupTests.ts` (via `setupFilesAfterEnv`), this call runs before any
// test file imports `@clerk/clerk-react`, so Jest's module registry swaps
// in the factory below. The factory returns stable function references
// whose bodies close over `currentUser` / `signedIn` — so updates from
// `setTestUser(...)` take effect on the very next hook call without needing
// to re-register the mock.
jest.mock('@clerk/clerk-react', () => {
  const passThrough = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);

  return {
    __esModule: true,

    // Providers — render children as-is; real auth is irrelevant for tests.
    ClerkProvider: passThrough,
    ClerkLoaded: passThrough,
    ClerkLoading: () => null,

    // Visibility gates keyed off of the mock signed-in flag.
    SignedIn: ({ children }: { children?: React.ReactNode }) =>
      signedIn ? React.createElement(React.Fragment, null, children) : null,
    SignedOut: ({ children }: { children?: React.ReactNode }) =>
      !signedIn ? React.createElement(React.Fragment, null, children) : null,

    // UI surfaces reduced to predictable test stubs.
    SignIn: () => React.createElement('div', { 'data-testid': 'clerk-sign-in' }),
    SignUp: () => React.createElement('div', { 'data-testid': 'clerk-sign-up' }),
    UserButton: () => React.createElement('div', { 'data-testid': 'clerk-user-button' }),

    // Hooks.
    useUser: () => ({
      isLoaded: true,
      isSignedIn: signedIn,
      user: signedIn ? buildClerkUser() : null,
    }),
    useAuth: () => ({
      isLoaded: true,
      isSignedIn: signedIn,
      userId: signedIn ? currentUser.id : null,
      sessionId: signedIn ? 'sess_test' : null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      getToken: jest.fn().mockResolvedValue(signedIn ? 'test-token' : null),
      signOut: jest.fn().mockResolvedValue(undefined),
    }),
    useClerk: () => ({
      signOut: jest.fn().mockResolvedValue(undefined),
      openSignIn: jest.fn(),
      openSignUp: jest.fn(),
    }),
    useSession: () => ({
      isLoaded: true,
      isSignedIn: signedIn,
      session: signedIn ? { id: 'sess_test' } : null,
    }),
  };
});
