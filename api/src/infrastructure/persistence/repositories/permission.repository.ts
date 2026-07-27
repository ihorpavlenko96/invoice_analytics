import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from '../../../domain/entities/role-permission.entity';
import { PermissionResource } from '../../../domain/enums/permission-resource.enum';
import { PermissionAction } from '../../../domain/enums/permission-action.enum';
import { RoleName } from '../../../domain/enums/role-name.enum';
import { IPermissionRepository } from '../../../application/repositories/permission.repository.interface';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
    constructor(
        @InjectRepository(RolePermission)
        private readonly ormRepository: Repository<RolePermission>,
    ) {}

    async findByRoleId(roleId: string): Promise<RolePermission[]> {
        return this.ormRepository.find({ where: { roleId } });
    }

    async replaceForRole(
        roleId: string,
        permissions: { resource: PermissionResource; action: PermissionAction }[],
    ): Promise<RolePermission[]> {
        return this.ormRepository.manager.transaction(async (em) => {
            await em.delete(RolePermission, { roleId });

            if (!permissions.length) {
                return [];
            }

            const rows = permissions.map((p) =>
                em.create(RolePermission, {
                    roleId,
                    resource: p.resource,
                    action: p.action,
                }),
            );

            return em.save(rows);
        });
    }

    async hasPermissionForRoleNames(
        roleNames: RoleName[],
        resource: PermissionResource,
        action: PermissionAction,
    ): Promise<boolean> {
        if (roleNames.length === 0) {
            return false;
        }

        const count = await this.ormRepository
            .createQueryBuilder('rp')
            .innerJoin('rp.role', 'role')
            .where('role.name IN (:...roleNames)', { roleNames })
            .andWhere('rp.resource = :resource', { resource })
            .andWhere('rp.action = :action', { action })
            .getCount();

        return count > 0;
    }
}
