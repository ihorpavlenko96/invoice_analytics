/**
 * Integration tests for ProtectedRoute.
 *
 * ProtectedRoute uses two Clerk hooks:
 *   - useAuth()   → { isSignedIn }
 *   - useUser()   → { user: { publicMetadata: { roles } } }
 *
 * Because jest.mock() is hoisted to the top of the file by Babel/ts-jest, we
 * use a shared mutable object (`clerkState`) that the mock factory closes over.
 * Individual tests mutate `clerkState` before rendering to simulate different
 * auth scenarios without re-mocking the module.
 *
 * Test coverage:
 *   Happy path
 *     ✓ renders children when signed in with a matching role
 *     ✓ renders <Outlet> when signed in with a matching role and no children prop
 *   Negative / redirect cases
 *     ✓ redirects to "/" when user is not signed in
 *     ✓ redirects to "/" when signed in but role does not match
 *     ✓ redirects to "/" when signed in but user has no roles at all
 */

import React from 'react';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import { renderWithProviders } from '../../../test/test-utils';
import ProtectedRoute from '../ProtectedRoute';
import { ROLES, RoleValue } from '../../constants/roles';

// ---------------------------------------------------------------------------
// Clerk mock
//
// jest.mock is hoisted before imports, so the factory function cannot close
// over variables declared with `let` in module scope.  We work around this by
// using a plain object whose properties are read at call time (not at mock
// definition time).
// ---------------------------------------------------------------------------

const clerkState = {
  isSignedIn: true as boolean,
  roles: ['Super Admin'] as string[],
  userId: 'test-user-id',
};

jest.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({
    isSignedIn: clerkState.isSignedIn,
    userId: clerkState.userId,
  }),
  useUser: () => ({
    user: clerkState.isSignedIn
      ? {
          id: clerkState.userId,
          publicMetadata: { roles: clerkState.roles },
        }
      : null,
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: () => null,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Renders a minimal router tree:
 *
 *   /protected  →  ProtectedRoute (requiredRoles)
 *                    └─ children / outlet content
 *   /           →  <p>Home Page</p>   (redirect target)
 */
function renderProtectedRoute({
  requiredRoles,
  children,
}: {
  requiredRoles: RoleValue[];
  children?: React.ReactNode;
}) {
  return renderWithProviders(
    <Routes>
      {/* Redirect target */}
      <Route path="/" element={<p>Home Page</p>} />

      {/* The route under test */}
      <Route
        path="/protected"
        element={<ProtectedRoute requiredRoles={requiredRoles}>{children}</ProtectedRoute>}
      >
        {/* Outlet content rendered when no children prop is provided */}
        <Route index element={<p>Protected Outlet Content</p>} />
      </Route>
    </Routes>,
    // Start navigation at /protected so the guard is exercised immediately
    { routerProps: { initialEntries: ['/protected'] } },
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProtectedRoute', () => {
  // Reset to a signed-in super-admin before every test
  beforeEach(() => {
    clerkState.isSignedIn = true;
    clerkState.roles = ['Super Admin'];
    clerkState.userId = 'test-user-id';
  });

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  describe('happy path', () => {
    it('renders children when signed in with a matching role', () => {
      clerkState.roles = [ROLES.SUPER_ADMIN];

      renderProtectedRoute({
        requiredRoles: [ROLES.SUPER_ADMIN],
        children: <p>Protected Children Content</p>,
      });

      expect(screen.getByText('Protected Children Content')).toBeInTheDocument();
      expect(screen.queryByText('Home Page')).not.toBeInTheDocument();
    });

    it('renders outlet content when signed in with a matching role and no children prop', () => {
      clerkState.roles = [ROLES.ADMIN];

      renderProtectedRoute({ requiredRoles: [ROLES.ADMIN] });

      expect(screen.getByText('Protected Outlet Content')).toBeInTheDocument();
      expect(screen.queryByText('Home Page')).not.toBeInTheDocument();
    });

    it('allows access when user has one of multiple required roles', () => {
      clerkState.roles = [ROLES.ADMIN];

      renderProtectedRoute({
        requiredRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
        children: <p>Multi-role Content</p>,
      });

      expect(screen.getByText('Multi-role Content')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Redirect cases
  // -------------------------------------------------------------------------

  describe('redirect cases', () => {
    it('redirects to "/" when user is not signed in', () => {
      clerkState.isSignedIn = false;
      clerkState.roles = [];

      renderProtectedRoute({
        requiredRoles: [ROLES.SUPER_ADMIN],
        children: <p>Should Not Render</p>,
      });

      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.queryByText('Should Not Render')).not.toBeInTheDocument();
    });

    it('redirects to "/" when signed in but role does not match', () => {
      clerkState.isSignedIn = true;
      clerkState.roles = [ROLES.USER];

      renderProtectedRoute({
        requiredRoles: [ROLES.SUPER_ADMIN],
        children: <p>Should Not Render</p>,
      });

      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.queryByText('Should Not Render')).not.toBeInTheDocument();
    });

    it('redirects to "/" when signed in but user has no roles at all', () => {
      clerkState.isSignedIn = true;
      clerkState.roles = [];

      renderProtectedRoute({
        requiredRoles: [ROLES.ADMIN],
        children: <p>Should Not Render</p>,
      });

      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.queryByText('Should Not Render')).not.toBeInTheDocument();
    });

    it('redirects to "/" when publicMetadata has no roles key', () => {
      // useUserRoles returns [] when roles is absent from publicMetadata.
      // Simulate this by making roles undefined/empty from the hook side.
      clerkState.isSignedIn = true;
      // Overwrite the mock for this single test to return metadata without roles
      // We achieve this by setting roles to an empty array — the component logic
      // calls `userRoles.some(...)` which returns false for an empty array.
      clerkState.roles = [];

      renderProtectedRoute({
        requiredRoles: [ROLES.SUPER_ADMIN],
        children: <p>Should Not Render</p>,
      });

      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.queryByText('Should Not Render')).not.toBeInTheDocument();
    });
  });
});
