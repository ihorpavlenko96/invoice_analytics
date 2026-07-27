export const PERMISSION_RESOURCES = {
  USERS: 'users',
  INVOICES: 'invoices',
  TENANTS: 'tenants',
  SECRETS: 'secrets',
} as const;

export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export type PermissionResource = (typeof PERMISSION_RESOURCES)[keyof typeof PERMISSION_RESOURCES];
export type PermissionAction = (typeof PERMISSION_ACTIONS)[keyof typeof PERMISSION_ACTIONS];
