/**
 * app.factory.ts — bootstraps a full NestJS application for e2e integration
 * tests, wiring in a real database (testcontainer) and a mocked Clerk client.
 *
 * Strategy for injecting test DB credentials
 * ------------------------------------------
 * The simplest and most reliable approach is to mutate `process.env` with the
 * testcontainer's connection details BEFORE Jest loads (and therefore caches)
 * the AppModule.  `getTypeOrmConfig` in `typeorm.config.ts` reads those env
 * vars at runtime via ConfigService, so the module will pick up the overrides
 * automatically.
 *
 * Sentry
 * ------
 * `SentryModule.forRoot()` is a singleton that tries to reach Sentry's SDK at
 * startup.  We neutralise it by setting `SENTRY_DSN` to an empty string so the
 * SDK initialises in a no-op mode.
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/api/modules/app.module';
import { DbConnectionOptions } from './database.helper';

export interface TestApp {
    app: INestApplication;
    module: TestingModule;
}

/**
 * Creates and initialises a full NestJS application for integration testing.
 *
 * The caller is responsible for setting `process.env.DB_*` variables BEFORE
 * calling this function (typically by calling `DatabaseHelper.getConnectionOptions`
 * and assigning the values, as shown in the spec files).
 *
 * @param dbOptions  Connection details returned by `DatabaseHelper.getConnectionOptions()`.
 *                   These are applied to `process.env` so that `ConfigService` /
 *                   `getTypeOrmConfig` picks them up at module-compile time.
 */
export async function createTestApp(dbOptions: DbConnectionOptions): Promise<TestApp> {
    // Inject DB connection details into process.env so that
    // TypeOrmModule.forRootAsync / getTypeOrmConfig resolves them correctly.
    process.env.DB_HOST = dbOptions.host;
    process.env.DB_PORT = String(dbOptions.port);
    process.env.DB_USERNAME = dbOptions.username;
    process.env.DB_PASSWORD = dbOptions.password;
    process.env.DB_DATABASE = dbOptions.database;

    // Prevent Sentry from making real network calls during tests.
    process.env.SENTRY_DSN = '';

    const module: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = module.createNestApplication();

    // Mirror the production ValidationPipe configuration from main.ts.
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Mirror the global prefix from main.ts.
    app.setGlobalPrefix('api');

    await app.init();

    return { app, module };
}
