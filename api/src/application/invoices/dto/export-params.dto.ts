import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for invoice export parameters
 * Includes only filters (no pagination) to export all matching invoices
 */
export class ExportParamsDto {
    @ApiProperty({
        description: 'Filter invoices by status',
        example: 'PAID',
        enum: ['PAID', 'UNPAID', 'OVERDUE'],
        required: false,
    })
    @IsString()
    @IsIn(['PAID', 'UNPAID', 'OVERDUE'])
    @IsOptional()
    status?: string;

    @ApiProperty({
        description: 'Include archived invoices in export',
        example: false,
        default: false,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    includeArchived?: boolean = false;
}
