import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for export endpoint filters.
 * Intentionally omits page/limit — exports are never paginated.
 */
export class ExportFiltersDto {
    @ApiProperty({
        description: 'Filter exported invoices by status',
        example: 'PAID',
        enum: ['PAID', 'UNPAID', 'OVERDUE'],
        required: false,
    })
    @IsString()
    @IsIn(['PAID', 'UNPAID', 'OVERDUE'])
    @IsOptional()
    status?: string;

    @ApiProperty({
        description: 'Include archived invoices in the export',
        example: false,
        default: false,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    includeArchived: boolean = false;
}
