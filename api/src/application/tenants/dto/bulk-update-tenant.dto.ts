import { IsArray, ValidateNested, IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class BulkUpdateItem {
    @ApiProperty({
        description: 'Tenant ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    id: string;

    @ApiProperty({
        description: 'Name of the tenant',
        example: 'Updated Corporation Name',
        required: false,
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @ApiProperty({
        description: 'Alias of the tenant',
        example: 'updated-corp',
        required: false,
        maxLength: 50,
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    alias?: string;
}

export class BulkUpdateTenantDto {
    @ApiProperty({
        description: 'Array of tenants to update',
        type: [BulkUpdateItem],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkUpdateItem)
    updates: BulkUpdateItem[];
}
