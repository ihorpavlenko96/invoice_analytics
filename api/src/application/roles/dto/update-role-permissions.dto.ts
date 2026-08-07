import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionResource } from '../../../domain/enums/permission-resource.enum';
import { PermissionAction } from '../../../domain/enums/permission-action.enum';

class PermissionItemDto {
    @ApiProperty({ enum: PermissionResource })
    @IsEnum(PermissionResource)
    resource: PermissionResource;

    @ApiProperty({ enum: PermissionAction })
    @IsEnum(PermissionAction)
    action: PermissionAction;
}

export class UpdateRolePermissionsDto {
    @ApiProperty({ type: [PermissionItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PermissionItemDto)
    permissions: PermissionItemDto[];
}
