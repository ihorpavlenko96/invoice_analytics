import { ApiProperty } from '@nestjs/swagger';

export class MonthlyTrendItemDto {
    @ApiProperty({
        description: 'Year',
        example: 2023,
    })
    year!: number;

    @ApiProperty({
        description: 'Month (1-12)',
        example: 6,
    })
    month!: number;

    @ApiProperty({
        description: 'Total amount for this month',
        example: 12500.75,
    })
    totalAmount!: number;

    @ApiProperty({
        description: 'Number of invoices for this month',
        example: 25,
    })
    invoiceCount!: number;
}

export class MonthlyTrendsDto {
    @ApiProperty({
        description: 'Monthly invoice trends',
        type: [MonthlyTrendItemDto],
    })
    trends!: MonthlyTrendItemDto[];
}
