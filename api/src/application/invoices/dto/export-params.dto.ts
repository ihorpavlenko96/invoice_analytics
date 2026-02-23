import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for invoice export parameters
 * Excludes pagination params (page/limit) to export ALL invoices matching filters
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
