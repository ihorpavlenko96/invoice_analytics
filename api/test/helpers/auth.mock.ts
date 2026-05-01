/**
 * auth.mock.ts — helpers for mocking Clerk JWT verification in e2e tests.
 *
 * IMPORTANT: `jest.mock('@clerk/clerk-sdk-node', ...)` must be called at the
 * TOP LEVEL of every spec file that uses this helper, before any imports that
 * transitively pull in the Clerk SDK.  The factory function below provides the
 * initial (pass-through) implementation; individual tests can then use
 * `mockClerkVerifyToken` to configure the exact claims that should be returned.
 *
 * Recommended module-level setup in each spec file:
 *
 *   jest.mock('@clerk/clerk-sdk-node', () => ({
 *     clerkClient: { verifyToken: jest.fn() },
 *   }));
 */

import { clerkClient } from '@clerk/clerk-sdk-node';

// ----- Types ----------------------------------------------------------------

export interface TokenClaims {
    sub: string;
    roles: string[];
    tenantId: string;
    [key: string]: unknown;
}

// ----- Mock helpers ---------------------------------------------------------

/**
 * Configures `clerkClient.verifyToken` to resolve with the provided `claims`
 * for any token string passed to it.
 *
 * Must be called AFTER `jest.mock('@clerk/clerk-sdk-node', ...)` has been
 * established at the module level.
 */
export function mockClerkVerifyToken(claims: Record<string, unknown>): void {
    (clerkClient.verifyToken as jest.Mock).mockResolvedValue(claims);
}

/**
 * Resets `clerkClient.verifyToken` so it returns nothing (useful in afterEach
 * to avoid cross-test pollution).
 */
export function resetClerkMock(): void {
    (clerkClient.verifyToken as jest.Mock).mockReset();
}

// ----- Claim factory helpers ------------------------------------------------

const DEFAULT_TEST_TENANT_ID = 'test-tenant-id';

/**
 * Builds a minimal Clerk JWT claims object with sensible test defaults.
 * Any field can be overridden via `overrides`.
 */
export function createTokenClaims(overrides: Partial<TokenClaims> = {}): TokenClaims {
    return {
        sub: 'user_test_default',
        roles: [],
        tenantId: DEFAULT_TEST_TENANT_ID,
        ...overrides,
    };
}

/**
 * Returns claims that grant the `Super Admin` role.
 *
 * @param tenantId  Optional tenant identifier (defaults to a stable test value).
 */
export function createSuperAdminClaims(tenantId: string = DEFAULT_TEST_TENANT_ID): TokenClaims {
    return createTokenClaims({
        sub: 'user_test_super_admin',
        roles: ['Super Admin'],
        tenantId,
    });
}

/**
 * Returns claims that grant the `Admin` role.
 *
 * @param tenantId  Optional tenant identifier.
 */
export function createAdminClaims(tenantId: string = DEFAULT_TEST_TENANT_ID): TokenClaims {
    return createTokenClaims({
        sub: 'user_test_admin',
        roles: ['Admin'],
        tenantId,
    });
}

/**
 * Returns claims that grant the `User` role.
 *
 * @param tenantId  Optional tenant identifier.
 */
export function createUserClaims(tenantId: string = DEFAULT_TEST_TENANT_ID): TokenClaims {
    return createTokenClaims({
        sub: 'user_test_user',
        roles: ['User'],
        tenantId,
    });
}
