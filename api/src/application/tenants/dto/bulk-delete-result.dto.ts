import { ApiProperty } from '@nestjs/swagger';

class DeleteError {
    @ApiProperty({
        description: 'Tenant ID that failed to delete',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Error message',
        example: 'Tenant not found',
    })
    error: string;
}

export class BulkDeleteResultDto {
    @ApiProperty({
        description: 'Successfully deleted tenant IDs',
        type: [String],
        example: ['123e4567-e89b-12d3-a456-426614174000'],
    })
    successful: string[];

    @ApiProperty({
        description: 'Failed deletions with error messages',
        type: [DeleteError],
    })
    failed: DeleteError[];

    @ApiProperty({
        description: 'Total number of deletions attempted',
        example: 10,
    })
    total: number;

    @ApiProperty({
        description: 'Number of successful deletions',
        example: 8,
    })
    successCount: number;

    @ApiProperty({
        description: 'Number of failed deletions',
        example: 2,
    })
    failureCount: number;
}
