/**
 * `renderWithProviders` — the standard way to render a React tree inside
 * integration tests. It wires up the same providers the real app uses so
 * components behave as close to production as possible, while making sure
 * each test gets isolated state.
 *
 * Providers wired, outer → inner:
 *   1. MUI `ThemeProvider` (dark theme, stable across tests).
 *   2. `QueryClientProvider` with a fresh `QueryClient` per render so React
 *      Query caches never leak between tests.
 *   3. `MemoryRouter` so components that rely on React Router work without
 *      a real browser history.
 *
 * Clerk is intentionally NOT wrapped here — the `@clerk/clerk-react` module
 * is mocked globally via `./clerkMock.ts`, so Clerk hooks resolve to the
 * shared test fixtures regardless of where they are invoked in the tree.
 */
import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { darkTheme } from '../themes/darkTheme';

// Importing the Clerk mock here guarantees the `jest.mock('@clerk/clerk-react', …)`
// side effect is registered whenever a test uses `renderWithProviders`, even
// if the test file forgets to import `setupTests.ts` directly.
import './clerkMock';

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial entries for the in-memory router. Defaults to `['/']`. */
  routerProps?: MemoryRouterProps;
  /** Pre-configured `QueryClient` — otherwise a fresh one is created per render. */
  queryClient?: QueryClient;
}

/**
 * Build a `QueryClient` tuned for tests:
 * - no retries (failing API calls surface immediately)
 * - no refetch-on-window-focus (jsdom triggers focus events unexpectedly)
 * - silent logging so jest output stays readable
 */
export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

export const renderWithProviders = (
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
): RenderResult & { queryClient: QueryClient } => {
  const { routerProps, queryClient, ...renderOptions } = options;
  const client = queryClient ?? createTestQueryClient();

  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <MuiThemeProvider theme={darkTheme}>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/']} {...routerProps}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    </MuiThemeProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: client,
  };
};

// Re-export the Testing Library surface so tests can import everything from
// one place (`import { renderWithProviders, screen } from '@/test-utils/renderWithProviders'`).
export * from '@testing-library/react';
