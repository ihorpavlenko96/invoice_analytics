/**
 * AnalyticsController — integration (e2e) test suite.
 *
 * Spins up a real PostgreSQL testcontainer, runs all migrations, and boots the
 * full NestJS application.  If Docker is not available the suite is skipped.
 *
 * The DEFAULT_TENANT_ID env var is set so TenantMiddleware resolves tenantId
 * without calling Clerk; only the RolesGuard mock is exercised for auth checks.
 */

// --------------------------------------------------------------------------
// IMPORTANT: jest.mock must be called before any application imports.
// --------------------------------------------------------------------------
jest.mock('@clerk/clerk-sdk-node', () => ({
    clerkClient: { verifyToken: jest.fn() },
}));

import { INestApplication } from '@nestjs/common';
import { DatabaseHelper } from './helpers/database.helper';
import { createTestApp } from './helpers/app.factory';
import {
    mockClerkVerifyToken,
    resetClerkMock,
    createSuperAdminClaims,
    createAdminClaims,
    createUserClaims,
} from './helpers/auth.mock';
import {
    withSuperAdminAuth,
    withAdminAuth,
    withUserAuth,
    withNoAuth,
} from './helpers/request.helper';

// ---------------------------------------------------------------------------
// Suite setup
// ---------------------------------------------------------------------------

const TEST_TENANT_ID = 'analytics-test-tenant-id';

describe('AnalyticsController (e2e)', () => {
    const db = new DatabaseHelper();
    let app: INestApplication;
    let dockerAvailable = false;

    beforeAll(async () => {
        // DEFAULT_TENANT_ID causes TenantMiddleware to set req.tenantId
        // without calling clerkClient.verifyToken, keeping tests focused on
        // role-based auth rather than tenant resolution.
        process.env.DEFAULT_TENANT_ID = TEST_TENANT_ID;

        dockerAvailable = await db.start();

        if (!dockerAvailable) {
            return;
        }

        const testApp = await createTestApp(db.getConnectionOptions());
        app = testApp.app;
    }, 120_000);

    afterAll(async () => {
        if (app) {
            await app.close();
        }
        await db.stop();
        delete process.env.DEFAULT_TENANT_ID;
    });

    afterEach(() => {
        resetClerkMock();
    });

    // -----------------------------------------------------------------------
    // GET /api/analytics/summary
    // -----------------------------------------------------------------------

    describe('GET /api/analytics/summary', () => {
        it('returns summary analytics for ADMIN role (200)', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createAdminClaims(TEST_TENANT_ID));

            const res = await withAdminAuth(app)
                .get('/api/analytics/summary')
                .expect(200);

            // The response shape may evolve; validate structural invariants.
            expect(res.body).toBeDefined();
            expect(typeof res.body).toBe('object');
        });

        it('returns summary analytics for SUPER_ADMIN role (200)', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createSuperAdminClaims(TEST_TENANT_ID));

            const res = await withSuperAdminAuth(app)
                .get('/api/analytics/summary')
                .expect(200);

            expect(res.body).toBeDefined();
        });

        it('returns 403 for USER role', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createUserClaims(TEST_TENANT_ID));

            await withUserAuth(app)
                .get('/api/analytics/summary')
                .expect(403);
        });

        it('returns 403 when no auth token', async () => {
            if (!dockerAvailable) return;

            // RolesGuard short-circuits to false (returns 403) when no token
            // is present.
            await withNoAuth(app)
                .get('/api/analytics/summary')
                .expect(403);
        });

        it('returns 400 for invalid date format in query params', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createAdminClaims(TEST_TENANT_ID));

            // `from` must be an ISO 8601 date string; "not-a-date" fails
            // @IsDateString() validation, triggering the global ValidationPipe.
            await withAdminAuth(app)
                .get('/api/analytics/summary')
                .query({ from: 'not-a-date' })
                .expect(400);
        });

        it('returns 200 with valid date range query params', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createAdminClaims(TEST_TENANT_ID));

            await withAdminAuth(app)
                .get('/api/analytics/summary')
                .query({ from: '2023-01-01', to: '2023-12-31' })
                .expect(200);
        });
    });

    // -----------------------------------------------------------------------
    // GET /api/analytics/status-distribution
    // -----------------------------------------------------------------------

    describe('GET /api/analytics/status-distribution', () => {
        it('returns status distribution for ADMIN role (200)', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createAdminClaims(TEST_TENANT_ID));

            const res = await withAdminAuth(app)
                .get('/api/analytics/status-distribution')
                .expect(200);

            expect(res.body).toBeDefined();
        });

        it('returns 403 for USER role', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createUserClaims(TEST_TENANT_ID));

            await withUserAuth(app)
                .get('/api/analytics/status-distribution')
                .expect(403);
        });
    });

    // -----------------------------------------------------------------------
    // GET /api/analytics/monthly-trends
    // -----------------------------------------------------------------------

    describe('GET /api/analytics/monthly-trends', () => {
        it('returns monthly trends for ADMIN role (200)', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createAdminClaims(TEST_TENANT_ID));

            const res = await withAdminAuth(app)
                .get('/api/analytics/monthly-trends')
                .expect(200);

            expect(res.body).toBeDefined();
        });

        it('returns 403 for USER role', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createUserClaims(TEST_TENANT_ID));

            await withUserAuth(app)
                .get('/api/analytics/monthly-trends')
                .expect(403);
        });
    });

    // -----------------------------------------------------------------------
    // GET /api/analytics/top-vendors
    // -----------------------------------------------------------------------

    describe('GET /api/analytics/top-vendors', () => {
        it('returns top vendors for ADMIN role (200)', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createAdminClaims(TEST_TENANT_ID));

            const res = await withAdminAuth(app)
                .get('/api/analytics/top-vendors')
                .expect(200);

            expect(res.body).toBeDefined();
        });

        it('returns 403 for USER role', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createUserClaims(TEST_TENANT_ID));

            await withUserAuth(app)
                .get('/api/analytics/top-vendors')
                .expect(403);
        });
    });

    // -----------------------------------------------------------------------
    // GET /api/analytics/top-customers
    // -----------------------------------------------------------------------

    describe('GET /api/analytics/top-customers', () => {
        it('returns top customers for ADMIN role (200)', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createAdminClaims(TEST_TENANT_ID));

            const res = await withAdminAuth(app)
                .get('/api/analytics/top-customers')
                .expect(200);

            expect(res.body).toBeDefined();
        });

        it('returns 403 for USER role', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createUserClaims(TEST_TENANT_ID));

            await withUserAuth(app)
                .get('/api/analytics/top-customers')
                .expect(403);
        });
    });
});
