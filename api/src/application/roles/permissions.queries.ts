import { Injectable, Inject } from '@nestjs/common';
import {
    IPermissionRepository,
    PERMISSION_REPOSITORY,
} from '../repositories/permission.repository.interface';
import { IPermissionsQueries } from './interfaces/permissions-queries.interface';
import { PermissionDto } from './dto/permission.dto';
import { PermissionResource } from '../../domain/enums/permission-resource.enum';
import { PermissionAction } from '../../domain/enums/permission-action.enum';
import { RoleName } from '../../domain/enums/role-name.enum';

@Injectable()
export class PermissionsQueries implements IPermissionsQueries {
    constructor(
        @Inject(PERMISSION_REPOSITORY)
        private readonly permissionRepository: IPermissionRepository,
    ) {}

    async getPermissionsForRole(roleId: string): Promise<PermissionDto[]> {
        const permissions = await this.permissionRepository.findByRoleId(roleId);

        return permissions.map((p) => ({ resource: p.resource, action: p.action }));
    }

    async isActionAllowed(
        roleNames: RoleName[],
        resource: PermissionResource,
        action: PermissionAction,
    ): Promise<boolean> {
        return this.permissionRepository.hasPermissionForRoleNames(roleNames, resource, action);
    }
}
