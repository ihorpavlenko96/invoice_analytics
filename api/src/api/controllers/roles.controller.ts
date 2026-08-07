import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Inject,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { Role } from '../../domain/entities/role.entity';
import {
    IRolesQueries,
    ROLES_QUERIES,
} from '../../application/roles/interfaces/roles-queries.interface';
import {
    IRolesCommands,
    ROLES_COMMANDS,
} from '../../application/roles/interfaces/roles-commands.interface';
import { CreateRoleDto } from '../../application/roles/dto/create-role.dto';
import { UpdateRoleDto } from '../../application/roles/dto/update-role.dto';
import { RoleDto } from '../../application/roles/dto/role.dto';
import { PermissionDto } from '../../application/roles/dto/permission.dto';
import { RoleName } from '../../domain/enums/role-name.enum';
import { Authorize } from '../../infrastructure/auth/decorators/authorize.decorator';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
    ApiParam,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@Authorize()
export class RolesController {
    constructor(
        @Inject(ROLES_QUERIES) private readonly rolesQueries: IRolesQueries,
        @Inject(ROLES_COMMANDS) private readonly rolesCommands: IRolesCommands,
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

    @Get('permissions')
    @ApiOperation({
        summary: 'Get permission catalog',
        description: 'All assignable resource+action permissions',
    })
    @ApiResponse({ status: 200, type: [PermissionDto] })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async findAllPermissions(): Promise<PermissionDto[]> {
        return this.rolesQueries.findAllPermissions();
    }

    @Post()
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create custom role' })
    @ApiBody({ type: CreateRoleDto })
    @ApiResponse({ status: 201, type: RoleDto })
    async create(@Body() dto: CreateRoleDto): Promise<RoleDto> {
        return this.rolesCommands.createRole(dto);
    }

    @Patch(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @ApiOperation({ summary: 'Update custom role' })
    @ApiParam({ name: 'id', description: 'Role ID' })
    @ApiBody({ type: UpdateRoleDto })
    @ApiResponse({ status: 200, type: RoleDto })
    async update(@Param('id') id: string, @Body() dto: UpdateRoleDto): Promise<RoleDto> {
        return this.rolesCommands.updateRole(id, dto);
    }

    @Delete(':id')
    @Authorize(RoleName.ADMIN, RoleName.SUPER_ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete custom role' })
    @ApiParam({ name: 'id', description: 'Role ID' })
    async remove(@Param('id') id: string): Promise<void> {
        return this.rolesCommands.deleteRole(id);
    }
}
