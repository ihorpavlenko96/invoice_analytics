import {
    Injectable,
    ConflictException,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Role } from '../../domain/entities/role.entity';
import { Permission } from '../../domain/entities/permission.entity';
import { RoleName } from '../../domain/enums/role-name.enum';
import { IRolesCommands } from './interfaces/roles-commands.interface';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleDto } from './dto/role.dto';

const BUILT_IN_NAMES = Object.values(RoleName) as string[];

@Injectable()
export class RolesCommands implements IRolesCommands {
    constructor(
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
        @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
    ) {}

    private mapToDto(role: Role): RoleDto {
        const dto = new RoleDto();
        dto.id = role.id;
        dto.name = role.name;
        dto.isBuiltIn = BUILT_IN_NAMES.includes(role.name);
        dto.permissions = (role.permissions ?? []).map((p) => ({
            id: p.id,
            resource: p.resource,
            action: p.action,
        }));
        return dto;
    }

    private assertNotBuiltIn(role: Role): void {
        if (BUILT_IN_NAMES.includes(role.name)) {
            throw new ForbiddenException('Built-in roles cannot be modified or deleted.');
        }
    }

    private async resolvePermissions(ids?: string[]): Promise<Permission[]> {
        if (!ids || ids.length === 0) return [];
        const found = await this.permissionRepository.findBy({ id: In(ids) });
        if (found.length !== new Set(ids).size) {
            throw new BadRequestException('One or more permission IDs are invalid.');
        }
        return found;
    }

    async createRole(dto: CreateRoleDto): Promise<RoleDto> {
        const existing = await this.roleRepository.findOne({ where: { name: dto.name } });
        if (existing) throw new ConflictException('A role with this name already exists.');
        const permissions = await this.resolvePermissions(dto.permissionIds);
        const saved = await this.roleRepository.save(
            this.roleRepository.create({ name: dto.name, permissions }),
        );
        return this.mapToDto(saved);
    }

    async updateRole(id: string, dto: UpdateRoleDto): Promise<RoleDto> {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: { permissions: true },
        });
        if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
        this.assertNotBuiltIn(role);

        if (dto.name !== undefined && dto.name !== role.name) {
            const clash = await this.roleRepository.findOne({
                where: { name: dto.name, id: Not(id) },
            });
            if (clash) throw new ConflictException('A role with this name already exists.');
            role.name = dto.name;
        }
        if (dto.permissionIds !== undefined) {
            role.permissions = await this.resolvePermissions(dto.permissionIds);
        }
        const saved = await this.roleRepository.save(role);
        return this.mapToDto(saved);
    }

    async deleteRole(id: string): Promise<void> {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: { users: true },
        });
        if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
        this.assertNotBuiltIn(role);
        if ((role.users?.length ?? 0) > 0) {
            throw new ConflictException('Cannot delete a role that is assigned to users.');
        }
        await this.roleRepository.remove(role);
    }
}
