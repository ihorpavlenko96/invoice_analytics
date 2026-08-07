/**
 * Harness smoke test.
 *
 * This spec exists purely to prove the integration-test wiring boots:
 * - Jest resolves and transforms a `.tsx` file.
 * - jest-dom matchers are registered.
 * - `renderWithProviders` mounts a trivial component without throwing.
 * - The Clerk mock returns a configurable user object.
 * - MSW is running (no unhandled-request errors are thrown).
 *
 * It can safely be deleted once real integration tests exist.
 */
import React from 'react';
import { useUser } from '@clerk/clerk-react';

import { renderWithProviders, screen } from './renderWithProviders';
import { setTestUser } from './clerkMock';
import { server } from './server';

const RolesProbe: React.FC = () => {
  const { user, isSignedIn } = useUser();
  const roles = (user?.publicMetadata?.roles as string[] | undefined) ?? [];
  return (
    <div>
      <span data-testid="signed-in">{String(isSignedIn)}</span>
      <span data-testid="roles">{roles.join(',')}</span>
      <span data-testid="email">{user?.primaryEmailAddress?.emailAddress ?? ''}</span>
    </div>
  );
};

describe('integration test harness', () => {
  it('renders a component through the provider stack', () => {
    renderWithProviders(<h1>harness ok</h1>);
    expect(screen.getByRole('heading', { name: /harness ok/i })).toBeInTheDocument();
  });

  it('exposes a configurable Clerk mock user to hooks', () => {
    setTestUser({ roles: ['Super Admin'], emailAddress: 'admin@example.com' });

    renderWithProviders(<RolesProbe />);

    expect(screen.getByTestId('signed-in')).toHaveTextContent('true');
    expect(screen.getByTestId('roles')).toHaveTextContent('Super Admin');
    expect(screen.getByTestId('email')).toHaveTextContent('admin@example.com');
  });

  it('has an MSW server instance ready for per-test handler overrides', () => {
    // The shared server is constructed in `./server.ts`; exposing `.use` and
    // `.resetHandlers` is enough to confirm it is the real msw/node instance.
    expect(typeof server.use).toBe('function');
    expect(typeof server.resetHandlers).toBe('function');
  });
});
