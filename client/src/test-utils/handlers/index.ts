/**
 * Aggregates MSW request handlers contributed by each feature module.
 *
 * Keep this file thin: per-module handlers live under their own folder
 * (e.g. `./tenants`) so that future tests colocate fixtures with the
 * module they cover. The default aggregate is empty on purpose —
 * infrastructure-only setup, no real API contracts committed yet.
 */
import type { RequestHandler } from 'msw';

import { tenantsHandlers } from './tenants';
import { usersHandlers } from './users';
import { secretsHandlers } from './secrets';
import { invoicesHandlers } from './invoices';

export const handlers: RequestHandler[] = [
  ...tenantsHandlers,
  ...usersHandlers,
  ...secretsHandlers,
  ...invoicesHandlers,
];
