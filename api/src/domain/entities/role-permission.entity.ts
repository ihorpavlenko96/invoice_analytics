import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Role } from './role.entity';
import { PermissionResource } from '../enums/permission-resource.enum';
import { PermissionAction } from '../enums/permission-action.enum';

@Entity({ name: 'role_permissions' })
@Unique('UQ_role_permission', ['role', 'resource', 'action'])
export class RolePermission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Role, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @Column({ name: 'role_id', type: 'uuid' })
    roleId: string;

    @Column({ type: 'enum', enum: PermissionResource })
    resource: PermissionResource;

    @Column({ type: 'enum', enum: PermissionAction })
    action: PermissionAction;
}
