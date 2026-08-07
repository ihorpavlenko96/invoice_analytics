import { Role } from '../../../domain/entities/role.entity';
import { Permission } from '../../../domain/entities/permission.entity';

export const ROLES_QUERIES = Symbol('IRolesQueries');

export interface IRolesQueries {
    findAllRoles(): Promise<Role[]>;
    findAllPermissions(): Promise<Permission[]>;
}
