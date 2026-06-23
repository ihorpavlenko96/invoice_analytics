/**
 * TenantController — integration (e2e) test suite.
 *
 * These tests spin up a real PostgreSQL instance via Testcontainers, run
 * all TypeORM migrations, and boot the full NestJS application.  If Docker is
 * not available in the current environment the entire suite is skipped
 * gracefully.
 *
 * Clerk auth is mocked at the module level so no real JWT tokens are needed.
 */

// --------------------------------------------------------------------------
// IMPORTANT: jest.mock must be called before any application imports so that
// when the NestJS DI container imports RolesGuard / TenantMiddleware the mock
// is already in place.
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

const TEST_TENANT_ID = 'test-tenant-id';

describe('TenantController (e2e)', () => {
    const db = new DatabaseHelper();
    let app: INestApplication;
    let dockerAvailable = false;

    beforeAll(async () => {
        // Set DEFAULT_TENANT_ID so TenantMiddleware never calls clerkClient
        // for tenant resolution — only the RolesGuard mock is exercised.
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

    afterEach(async () => {
        resetClerkMock();
        if (dockerAvailable) {
            await db.clearDatabase();
        }
    });

    // -----------------------------------------------------------------------
    // Helper to create a tenant directly via the API under test
    // -----------------------------------------------------------------------

    async function createTenant(name: string, alias: string) {
        mockClerkVerifyToken(createSuperAdminClaims(TEST_TENANT_ID));
        const res = await withSuperAdminAuth(app)
            .post('/api/tenants')
            .send({ name, alias })
            .expect(201);
        return res.body as { id: string; name: string; alias: string };
    }

    // -----------------------------------------------------------------------
    // POST /api/tenants
    // -----------------------------------------------------------------------

    describe('POST /api/tenants', () => {
        it('creates tenant successfully with SUPER_ADMIN role (201)', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createSuperAdminClaims(TEST_TENANT_ID));

            const res = await withSuperAdminAuth(app)
                .post('/api/tenants')
                .send({ name: 'Acme Corp', alias: 'acme-corp' })
                .expect(201);

            expect(res.body).toMatchObject({
                id: expect.any(String),
                name: 'Acme Corp',
                alias: 'acme-corp',
            });
        });

        it('returns 403 when called with ADMIN role', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createAdminClaims(TEST_TENANT_ID));

            await withAdminAuth(app)
                .post('/api/tenants')
                .send({ name: 'Acme Corp', alias: 'acme-corp' })
                .expect(403);
        });

        it('returns 403 when called with USER role', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createUserClaims(TEST_TENANT_ID));

            await withUserAuth(app)
                .post('/api/tenants')
                .send({ name: 'Acme Corp', alias: 'acme-corp' })
                .expect(403);
        });

        it('returns 403 when no auth token provided', async () => {
            if (!dockerAvailable) return;

            // RolesGuard throws when token is absent, NestJS maps it to 403
            await withNoAuth(app)
                .post('/api/tenants')
                .send({ name: 'Acme Corp', alias: 'acme-corp' })
                .expect(403);
        });

        it('returns 400 when name is missing', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createSuperAdminClaims(TEST_TENANT_ID));

            await withSuperAdminAuth(app)
                .post('/api/tenants')
                .send({ alias: 'acme-corp' })
                .expect(400);
        });

        it('returns 400 when alias has invalid format (uppercase)', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createSuperAdminClaims(TEST_TENANT_ID));

            await withSuperAdminAuth(app)
                .post('/api/tenants')
                .send({ name: 'Acme Corp', alias: 'ACME-CORP' })
                .expect(400);
        });

        it('returns 400 when alias is too long (> 50 chars)', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createSuperAdminClaims(TEST_TENANT_ID));

            const longAlias = 'a'.repeat(51);

            await withSuperAdminAuth(app)
                .post('/api/tenants')
                .send({ name: 'Acme Corp', alias: longAlias })
                .expect(400);
        });
    });

    // -----------------------------------------------------------------------
    // GET /api/tenants
    // -----------------------------------------------------------------------

    describe('GET /api/tenants', () => {
        it('returns list of tenants for SUPER_ADMIN (200)', async () => {
            if (!dockerAvailable) return;

            await createTenant('Tenant One', 'tenant-one');

            mockClerkVerifyToken(createSuperAdminClaims(TEST_TENANT_ID));

            const res = await withSuperAdminAuth(app).get('/api/tenants').expect(200);

            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            expect(res.body[0]).toMatchObject({
                id: expect.any(String),
                name: expect.any(String),
                alias: expect.any(String),
            });
        });

        it('returns 403 for ADMIN role', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createAdminClaims(TEST_TENANT_ID));

            await withAdminAuth(app).get('/api/tenants').expect(403);
        });
    });

    // -----------------------------------------------------------------------
    // GET /api/tenants/:id
    // -----------------------------------------------------------------------

    describe('GET /api/tenants/:id', () => {
        it('returns tenant by id for SUPER_ADMIN (200)', async () => {
            if (!dockerAvailable) return;

            const created = await createTenant('Look-up Corp', 'lookup-corp');

            mockClerkVerifyToken(createSuperAdminClaims(TEST_TENANT_ID));

            const res = await withSuperAdminAuth(app)
                .get(`/api/tenants/${created.id}`)
                .expect(200);

            expect(res.body).toMatchObject({
                id: created.id,
                name: 'Look-up Corp',
                alias: 'lookup-corp',
            });
        });

        it('returns 404 for non-existent id', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createSuperAdminClaims(TEST_TENANT_ID));

            await withSuperAdminAuth(app)
                .get('/api/tenants/00000000-0000-0000-0000-000000000000')
                .expect(404);
        });
    });

    // -----------------------------------------------------------------------
    // PATCH /api/tenants/:id
    // -----------------------------------------------------------------------

    describe('PATCH /api/tenants/:id', () => {
        it('updates tenant successfully (200)', async () => {
            if (!dockerAvailable) return;

            const created = await createTenant('Original Name', 'original-name');

            mockClerkVerifyToken(createSuperAdminClaims(TEST_TENANT_ID));

            const res = await withSuperAdminAuth(app)
                .patch(`/api/tenants/${created.id}`)
                .send({ name: 'Updated Name' })
                .expect(200);

            expect(res.body).toMatchObject({
                id: created.id,
                name: 'Updated Name',
                alias: 'original-name',
            });
        });

        it('returns 404 for non-existent tenant', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createSuperAdminClaims(TEST_TENANT_ID));

            await withSuperAdminAuth(app)
                .patch('/api/tenants/00000000-0000-0000-0000-000000000000')
                .send({ name: 'Updated Name' })
                .expect(404);
        });
    });

    // -----------------------------------------------------------------------
    // DELETE /api/tenants/:id
    // -----------------------------------------------------------------------

    describe('DELETE /api/tenants/:id', () => {
        it('deletes tenant successfully (204)', async () => {
            if (!dockerAvailable) return;

            const created = await createTenant('Delete Me', 'delete-me');

            mockClerkVerifyToken(createSuperAdminClaims(TEST_TENANT_ID));

            await withSuperAdminAuth(app)
                .delete(`/api/tenants/${created.id}`)
                .expect(204);
        });

        it('returns 404 for non-existent tenant', async () => {
            if (!dockerAvailable) return;

            mockClerkVerifyToken(createSuperAdminClaims(TEST_TENANT_ID));

            await withSuperAdminAuth(app)
                .delete('/api/tenants/00000000-0000-0000-0000-000000000000')
                .expect(404);
        });

        it('returns 403 for ADMIN role', async () => {
            if (!dockerAvailable) return;

            const created = await createTenant('Admin Delete Attempt', 'admin-delete-attempt');

            mockClerkVerifyToken(createAdminClaims(TEST_TENANT_ID));

            await withAdminAuth(app)
                .delete(`/api/tenants/${created.id}`)
                .expect(403);
        });
    });
});
