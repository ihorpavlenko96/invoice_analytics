import { PermissionDto } from '../dto/permission.dto';
import { UpdateRolePermissionsDto } from '../dto/update-role-permissions.dto';

export const PERMISSIONS_COMMANDS = Symbol('IPermissionsCommands');

export interface IPermissionsCommands {
    replaceRolePermissions(roleId: string, dto: UpdateRolePermissionsDto): Promise<PermissionDto[]>;
}
