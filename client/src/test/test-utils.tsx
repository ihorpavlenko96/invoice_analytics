/**
 * Custom render utilities for integration tests.
 *
 * Wraps components under test with all runtime providers that the application
 * uses (React Query, Router, Notistack) and provides a way to configure mock
 * Clerk auth state without touching the real Clerk SDK.
 *
 * Usage:
 *   import { renderWithProviders } from 'src/test/test-utils';
 *
 *   renderWithProviders(<MyComponent />, {
 *     authOptions: { isSignedIn: true, roles: ['Admin'] },
 *     routerProps: { initialEntries: ['/dashboard'] },
 *   });
 */

import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

// ---------------------------------------------------------------------------
// Clerk mock types & helpers
// ---------------------------------------------------------------------------

export interface AuthOptions {
  /** Whether the mock user is signed in. Defaults to true. */
  isSignedIn?: boolean;
  /** Roles placed in `user.publicMetadata.roles`. Defaults to ['Super Admin']. */
  roles?: string[];
  /** Clerk user id returned by useAuth/useUser. Defaults to 'test-user-id'. */
  userId?: string;
}

/**
 * Installs jest.mock('@clerk/clerk-react') with configurable auth state.
 *
 * Call this at the top of any test file that exercises Clerk-aware code.
 * The function returns helper setters so individual tests can override the
 * default state without re-mocking the whole module.
 *
 * Example:
 *   const { setAuthState } = mockClerk();
 *   it('redirects when signed out', () => {
 *     setAuthState({ isSignedIn: false });
 *     ...
 *   });
 */
export function mockClerk(defaults: AuthOptions = {}) {
  const state: Required<AuthOptions> = {
    isSignedIn: defaults.isSignedIn ?? true,
    roles: defaults.roles ?? ['Super Admin'],
    userId: defaults.userId ?? 'test-user-id',
  };

  jest.mock('@clerk/clerk-react', () => ({
    useAuth: () => ({
      isSignedIn: state.isSignedIn,
      userId: state.userId,
    }),
    useUser: () => ({
      user: state.isSignedIn
        ? {
            id: state.userId,
            publicMetadata: { roles: state.roles },
          }
        : null,
    }),
    // Passthrough components — just render children so the JSX compiles
    ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SignedOut: () => null,
  }));

  return {
    /** Override auth state between tests (mutates the shared closure). */
    setAuthState(overrides: Partial<AuthOptions>) {
      if (overrides.isSignedIn !== undefined) state.isSignedIn = overrides.isSignedIn;
      if (overrides.roles !== undefined) state.roles = overrides.roles;
      if (overrides.userId !== undefined) state.userId = overrides.userId;
    },
    getState: () => ({ ...state }),
  };
}

// ---------------------------------------------------------------------------
// Provider wrapper
// ---------------------------------------------------------------------------

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Options forwarded to MemoryRouter (e.g. initialEntries, initialIndex). */
  routerProps?: MemoryRouterProps;
  /**
   * Pre-configured QueryClient. When omitted a fresh client is created with
   * retry disabled so React Query errors surface immediately in tests.
   */
  queryClient?: QueryClient;
}

/** Return type includes the QueryClient so tests can inspect cache state. */
export interface RenderWithProvidersResult extends RenderResult {
  queryClient: QueryClient;
}

/**
 * Renders `ui` inside the full provider tree used by the application.
 *
 * Providers (outermost → innermost):
 *   MemoryRouter  →  QueryClientProvider  →  SnackbarProvider  →  ui
 */
export function renderWithProviders(
  ui: React.ReactElement,
  {
    routerProps,
    queryClient,
    ...renderOptions
  }: RenderWithProvidersOptions = {},
): RenderWithProvidersResult {
  // Create a fresh QueryClient per render call unless the caller supplies one.
  // Retries are disabled so async errors are thrown immediately in tests.
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter {...routerProps}>
        <QueryClientProvider client={client}>
          <SnackbarProvider maxSnack={3}>{children}</SnackbarProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  }

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return { ...result, queryClient: client };
}

// Re-export everything from RTL so test files only need to import from here.
export * from '@testing-library/react';
