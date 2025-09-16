import { ApiProperty } from '@nestjs/swagger';
import { TenantDto } from './tenant.dto';

class UpdateError {
    @ApiProperty({
        description: 'Tenant ID that failed to update',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Error message',
        example: 'Tenant not found',
    })
    error: string;
}

export class BulkUpdateResultDto {
    @ApiProperty({
        description: 'Successfully updated tenants',
        type: [TenantDto],
    })
    successful: TenantDto[];

    @ApiProperty({
        description: 'Failed updates with error messages',
        type: [UpdateError],
    })
    failed: UpdateError[];

    @ApiProperty({
        description: 'Total number of updates attempted',
        example: 10,
    })
    total: number;

    @ApiProperty({
        description: 'Number of successful updates',
        example: 8,
    })
    successCount: number;

    @ApiProperty({
        description: 'Number of failed updates',
        example: 2,
    })
    failureCount: number;
}
