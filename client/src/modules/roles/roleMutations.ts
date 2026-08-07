import axios from 'axios';
import { Permission } from './types/permission';

export type UpdateRolePermissionsPayload = { roleId: string; permissions: Permission[] };

export const updateRolePermissions = ({ roleId, permissions }: UpdateRolePermissionsPayload) =>
  axios.put(`/roles/${roleId}/permissions`, { permissions });
