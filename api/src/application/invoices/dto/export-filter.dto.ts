import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for filtering invoices during export.
 * Intentionally excludes pagination parameters so that ALL matching invoices
 * are included in the exported file rather than just a single page.
 */
export class ExportFilterDto {
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
    includeArchived?: boolean = false;
}
