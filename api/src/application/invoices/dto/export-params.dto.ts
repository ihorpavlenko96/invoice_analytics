import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn, IsString, IsDateString } from 'class-validator';

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
        description: 'Filter invoices with issue date from this date (inclusive)',
        example: '2024-01-01',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    dateFrom?: string;

    @ApiProperty({
        description: 'Filter invoices with issue date to this date (inclusive)',
        example: '2024-12-31',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    dateTo?: string;
}
