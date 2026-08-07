import { Controller, Get, Put, Param, Body, Inject } from '@nestjs/common';
import { Role } from '../../domain/entities/role.entity';
import {
    IRolesQueries,
    ROLES_QUERIES,
} from '../../application/roles/interfaces/roles-queries.interface';
import {
    IPermissionsQueries,
    PERMISSIONS_QUERIES,
} from '../../application/roles/interfaces/permissions-queries.interface';
import {
    IPermissionsCommands,
    PERMISSIONS_COMMANDS,
} from '../../application/roles/interfaces/permissions-commands.interface';
import { PermissionDto } from '../../application/roles/dto/permission.dto';
import { UpdateRolePermissionsDto } from '../../application/roles/dto/update-role-permissions.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiUnauthorizedResponse,
    ApiBody,
    ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@Authorize()
export class RolesController {
    constructor(
        @Inject(ROLES_QUERIES) private readonly rolesQueries: IRolesQueries,
        @Inject(PERMISSIONS_QUERIES) private readonly permissionsQueries: IPermissionsQueries,
        @Inject(PERMISSIONS_COMMANDS) private readonly permissionsCommands: IPermissionsCommands,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get all roles', description: 'Retrieves all available roles' })
    @ApiResponse({
        status: 200,
        description: 'List of roles retrieved successfully',
        type: [Role],
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findAll(): Promise<Role[]> {
        return this.rolesQueries.findAllRoles();
    }

    @Get(':id/permissions')
    @Authorize(RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Get permissions for a role' })
    @ApiResponse({ status: 200, type: [PermissionDto] })
    async getPermissions(@Param('id') id: string): Promise<PermissionDto[]> {
        return this.permissionsQueries.getPermissionsForRole(id);
    }

    @Put(':id/permissions')
    @Authorize(RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Replace permissions for a role' })
    @ApiBody({ type: UpdateRolePermissionsDto })
    @ApiResponse({ status: 200, type: [PermissionDto] })
    @ApiNotFoundResponse({ description: 'Role not found' })
    async setPermissions(
        @Param('id') id: string,
        @Body() dto: UpdateRolePermissionsDto,
    ): Promise<PermissionDto[]> {
        return this.permissionsCommands.replaceRolePermissions(id, dto);
    }
}
