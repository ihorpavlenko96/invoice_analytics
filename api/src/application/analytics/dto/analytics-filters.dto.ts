import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class AnalyticsFiltersDto {
    @ApiProperty({
        description: 'Start date for filtering (ISO 8601 format)',
        example: '2023-01-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiProperty({
        description: 'End date for filtering (ISO 8601 format)',
        example: '2023-12-31',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    to?: string;
}