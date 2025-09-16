import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteTenantDto {
    @ApiProperty({
        description: 'Array of tenant IDs to delete',
        type: [String],
        example: ['123e4567-e89b-12d3-a456-426614174000', '987f6543-e21b-12d3-a456-426614174000'],
    })
    @IsArray()
    @IsUUID('4', { each: true })
    ids: string[];
}
