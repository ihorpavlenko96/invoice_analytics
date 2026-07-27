import axios from 'axios';
import { Role } from '../users/types/user';
import { Permission } from './types/permission';

export const getRoles = () => axios.get<Role[]>('/roles');

export const getRolePermissions = (roleId: string) =>
  axios.get<Permission[]>(`/roles/${roleId}/permissions`);
