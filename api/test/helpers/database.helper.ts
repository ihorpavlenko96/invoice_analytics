/**
 * DatabaseHelper — manages a throwaway PostgreSQL testcontainer for e2e tests.
 *
 * Usage pattern:
 *   const db = new DatabaseHelper();
 *   await db.start();                  // starts container & runs migrations
 *   process.env.DB_* = db.getConnectionOptions();   // injected before app boot
 *   ...tests...
 *   await db.clearDatabase();          // between test cases if needed
 *   await db.stop();                   // afterAll cleanup
 *
 * If Docker is unavailable (e.g. in certain CI environments) `start()` returns
 * `false` and the caller should skip the test suite.
 */

import * as path from 'path';
import { DataSource } from 'typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export interface DbConnectionOptions {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}

export class DatabaseHelper {
    private container: StartedPostgreSqlContainer | null = null;
    private dataSource: DataSource | null = null;

    /**
     * Starts a PostgreSQL testcontainer and runs all TypeORM migrations.
     *
     * @returns `true` if startup succeeded, `false` if Docker is unavailable.
     */
    async start(): Promise<boolean> {
        try {
            this.container = await new PostgreSqlContainer('postgres:15-alpine').start();

            this.dataSource = new DataSource({
                type: 'postgres',
                host: this.container.getHost(),
                port: this.container.getPort(),
                username: this.container.getUsername(),
                password: this.container.getPassword(),
                database: this.container.getDatabase(),
                entities: [
                    path.join(__dirname, '../../src/domain/entities/*.entity.ts'),
                ],
                migrations: [
                    path.join(
                        __dirname,
                        '../../src/infrastructure/persistence/migrations/**/*{.ts,.js}',
                    ),
                ],
                // ts-node is available in the test environment so TypeScript
                // migration files can be executed directly.
                synchronize: false,
                logging: false,
            });

            await this.dataSource.initialize();
            await this.dataSource.runMigrations();

            return true;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(
                `[DatabaseHelper] Could not start PostgreSQL testcontainer: ${message}. ` +
                    'Tests that require a database will be skipped.',
            );
            return false;
        }
    }

    /**
     * Returns the connection options for the started container so they can be
     * injected into `process.env` before the NestJS app module is compiled.
     *
     * Throws if `start()` has not been called or failed.
     */
    getConnectionOptions(): DbConnectionOptions {
        if (!this.container) {
            throw new Error('[DatabaseHelper] Container is not running. Call start() first.');
        }

        return {
            host: this.container.getHost(),
            port: this.container.getPort(),
            username: this.container.getUsername(),
            password: this.container.getPassword(),
            database: this.container.getDatabase(),
        };
    }

    /**
     * Truncates all application tables in the correct order to avoid FK
     * constraint violations.  Call this inside `afterEach` to keep tests
     * independent.
     */
    async clearDatabase(): Promise<void> {
        if (!this.dataSource) {
            return;
        }

        const queryRunner = this.dataSource.createQueryRunner();

        try {
            await queryRunner.connect();
            // Disable FK checks for the duration of the truncation so we can
            // truncate tables regardless of their dependency order.
            await queryRunner.query('SET session_replication_role = replica;');
            await queryRunner.query('TRUNCATE TABLE "invoices" CASCADE;');
            await queryRunner.query('TRUNCATE TABLE "invoice_items" CASCADE;');
            await queryRunner.query('TRUNCATE TABLE "user_roles" CASCADE;');
            await queryRunner.query('TRUNCATE TABLE "users" CASCADE;');
            await queryRunner.query('TRUNCATE TABLE "tenants" CASCADE;');
            // Re-seed static roles data that the initial migration inserts.
            await queryRunner.query(
                `INSERT INTO "roles" ("name") VALUES ('Super Admin'), ('Admin'), ('User')
                 ON CONFLICT ("name") DO NOTHING`,
            );
            await queryRunner.query('SET session_replication_role = DEFAULT;');
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Stops the container and destroys the DataSource.  Call this in `afterAll`.
     */
    async stop(): Promise<void> {
        if (this.dataSource && this.dataSource.isInitialized) {
            await this.dataSource.destroy();
            this.dataSource = null;
        }

        if (this.container) {
            await this.container.stop();
            this.container = null;
        }
    }
}
