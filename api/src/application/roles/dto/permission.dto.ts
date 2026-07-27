import { ApiProperty } from '@nestjs/swagger';
import { PermissionResource } from '../../../domain/enums/permission-resource.enum';
import { PermissionAction } from '../../../domain/enums/permission-action.enum';

export class PermissionDto {
    @ApiProperty({ enum: PermissionResource })
    resource: PermissionResource;

    @ApiProperty({ enum: PermissionAction })
    action: PermissionAction;
}
