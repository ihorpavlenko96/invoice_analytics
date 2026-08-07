/**
 * request.helper.ts — thin wrappers around `supertest` that attach the
 * correct `Authorization` header for different user roles.
 *
 * Because `clerkClient.verifyToken` is mocked at the module level in the spec
 * files, the actual token string value is irrelevant — the mock always returns
 * the configured claims.  We use a fixed constant so log output is readable.
 *
 * Usage:
 *   const req = withSuperAdminAuth(app);
 *   await req.get('/api/tenants').expect(200);
 */

import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { App } from 'supertest/types';

// A fixed placeholder token; its value does not matter because verifyToken is
// mocked.  The string is intentionally descriptive for debugging purposes.
export const MOCK_TOKEN = 'mock-token';

// Type alias for the supertest agent bound to a NestJS app.
type SupertestAgent = ReturnType<typeof supertest.agent>;

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function createAgent(app: INestApplication<App>): SupertestAgent {
    return supertest.agent(app.getHttpServer());
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns a supertest agent with a `Super Admin` mock `Authorization` header.
 */
export function withSuperAdminAuth(app: INestApplication<App>): SupertestAgent {
    return createAgent(app).set('Authorization', MOCK_TOKEN);
}

/**
 * Returns a supertest agent with an `Admin` mock `Authorization` header.
 */
export function withAdminAuth(app: INestApplication<App>): SupertestAgent {
    return createAgent(app).set('Authorization', MOCK_TOKEN);
}

/**
 * Returns a supertest agent with a `User` mock `Authorization` header.
 */
export function withUserAuth(app: INestApplication<App>): SupertestAgent {
    return createAgent(app).set('Authorization', MOCK_TOKEN);
}

/**
 * Returns a supertest agent WITHOUT any `Authorization` header, simulating an
 * unauthenticated request.
 */
export function withNoAuth(app: INestApplication<App>): SupertestAgent {
    return createAgent(app);
}
