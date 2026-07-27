import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IRoleRepository, ROLE_REPOSITORY } from '../repositories/role.repository.interface';
import {
    IPermissionRepository,
    PERMISSION_REPOSITORY,
} from '../repositories/permission.repository.interface';
import { IPermissionsCommands } from './interfaces/permissions-commands.interface';
import { PermissionDto } from './dto/permission.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Injectable()
export class PermissionsCommands implements IPermissionsCommands {
    constructor(
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
        @Inject(PERMISSION_REPOSITORY)
        private readonly permissionRepository: IPermissionRepository,
    ) {}

    async replaceRolePermissions(
        roleId: string,
        dto: UpdateRolePermissionsDto,
    ): Promise<PermissionDto[]> {
        const role = await this.roleRepository.findById(roleId);

        if (!role) {
            throw new NotFoundException(`Role with ID ${roleId} not found`);
        }

        const unique = Array.from(
            new Map(dto.permissions.map((p) => [`${p.resource}:${p.action}`, p])).values(),
        );

        const saved = await this.permissionRepository.replaceForRole(roleId, unique);

        return saved.map((r) => ({ resource: r.resource, action: r.action }));
    }
}
