import { PermissionDto } from '../dto/permission.dto';
import { PermissionResource } from '../../../domain/enums/permission-resource.enum';
import { PermissionAction } from '../../../domain/enums/permission-action.enum';
import { RoleName } from '../../../domain/enums/role-name.enum';

export const PERMISSIONS_QUERIES = Symbol('IPermissionsQueries');

export interface IPermissionsQueries {
    getPermissionsForRole(roleId: string): Promise<PermissionDto[]>;
    isActionAllowed(
        roleNames: RoleName[],
        resource: PermissionResource,
        action: PermissionAction,
    ): Promise<boolean>;
}
