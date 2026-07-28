import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Unique } from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'permissions' })
@Unique('UQ_permissions_resource_action', ['resource', 'action'])
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    resource: string;

    @Column({ type: 'varchar', length: 100 })
    action: string;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles?: Role[];
}
