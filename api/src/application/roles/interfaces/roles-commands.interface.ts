import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleDto } from '../dto/role.dto';

export const ROLES_COMMANDS = Symbol('IRolesCommands');

export interface IRolesCommands {
    createRole(dto: CreateRoleDto): Promise<RoleDto>;
    updateRole(id: string, dto: UpdateRoleDto): Promise<RoleDto>;
    deleteRole(id: string): Promise<void>;
}
