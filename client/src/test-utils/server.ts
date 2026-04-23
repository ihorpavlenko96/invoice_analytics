/**
 * Shared MSW server used by every integration test.
 *
 * The default handler set is intentionally empty; each module contributes
 * its own handler folder under `./handlers/<module>` and re-exports the
 * aggregate list from `./handlers/index.ts`. Tests can still append
 * per-test overrides via `server.use(...)`.
 */
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
