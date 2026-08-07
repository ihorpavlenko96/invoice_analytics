import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleName } from 'src/domain/enums/role-name.enum';
import { PermissionResource } from 'src/domain/enums/permission-resource.enum';
import { PermissionAction } from 'src/domain/enums/permission-action.enum';
import { RolesGuard } from '../guards/roles.guard';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are required to access a resource.
 * @param roles - An array of RoleName enums representing the allowed roles.
 */
export function Authorize(...roles: RoleName[]) {
    return applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(RolesGuard));
}

export const PERMISSIONS_KEY = 'permissions';

export interface RequiredPermission {
    resource: PermissionResource;
    action: PermissionAction;
}

/**
 * Decorator to specify which resource permissions are required to access a resource.
 * @param permissions - The resource/action pairs required to access the handler.
 */
export function RequirePermissions(...permissions: RequiredPermission[]) {
    return SetMetadata(PERMISSIONS_KEY, permissions);
}
