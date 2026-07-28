import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../domain/entities/role.entity';
import { Permission } from '../../domain/entities/permission.entity';
import { IRolesQueries } from './interfaces/roles-queries.interface';

@Injectable()
export class RolesQueries implements IRolesQueries {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private readonly permissionRepository: Repository<Permission>,
    ) {}

    async findAllRoles(): Promise<Role[]> {
        return this.roleRepository.find({ relations: { permissions: true } });
    }

    async findAllPermissions(): Promise<Permission[]> {
        return this.permissionRepository.find({ order: { resource: 'ASC', action: 'ASC' } });
    }
}
