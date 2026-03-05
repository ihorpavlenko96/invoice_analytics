import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ExportFiltersDto {
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
