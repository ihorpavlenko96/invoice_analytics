import axios from 'axios';
import { Role, Permission } from './types/role';

export const getRoles = () => axios.get<Role[]>('/roles');
export const getPermissions = () => axios.get<Permission[]>('/roles/permissions');
