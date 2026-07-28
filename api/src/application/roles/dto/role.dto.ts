import { ApiProperty } from '@nestjs/swagger';
import { PermissionDto } from './permission.dto';

export class RoleDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ description: 'Role name (built-in or custom)', example: 'Billing Manager' })
    name: string;

    @ApiProperty({ type: [PermissionDto], required: false })
    permissions?: PermissionDto[];

    @ApiProperty({ description: 'True for the fixed Super Admin/Admin/User roles', example: false })
    isBuiltIn: boolean;
}
