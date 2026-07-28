import axios from 'axios';
import { Role } from './types/role';

export type CreateRoleInput = { name: string; permissionIds: string[] };
export type UpdateRoleInput = { name?: string; permissionIds?: string[] };
export type UpdateRolePayload = { id: string; data: UpdateRoleInput };

export const createRole = (data: CreateRoleInput) => axios.post<Role>('/roles', data);

export const updateRole = (payload: UpdateRolePayload) =>
  axios.patch<Role>(`/roles/${payload.id}`, payload.data);

export const deleteRole = (id: string) => axios.delete(`/roles/${id}`);
