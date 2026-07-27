import { RolePermission } from '../../domain/entities/role-permission.entity';
import { PermissionResource } from '../../domain/enums/permission-resource.enum';
import { PermissionAction } from '../../domain/enums/permission-action.enum';
import { RoleName } from '../../domain/enums/role-name.enum';

export const PERMISSION_REPOSITORY = 'IPermissionRepository';

export interface IPermissionRepository {
    findByRoleId(roleId: string): Promise<RolePermission[]>;
    replaceForRole(
        roleId: string,
        permissions: { resource: PermissionResource; action: PermissionAction }[],
    ): Promise<RolePermission[]>;
    hasPermissionForRoleNames(
        roleNames: RoleName[],
        resource: PermissionResource,
        action: PermissionAction,
    ): Promise<boolean>;
}
