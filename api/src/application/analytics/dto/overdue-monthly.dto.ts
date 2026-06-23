import { ApiProperty } from '@nestjs/swagger';

export class OverdueMonthlyItemDto {
    @ApiProperty({
        description: 'Year',
        example: 2024,
    })
    year!: number;

    @ApiProperty({
        description: 'Month (1-12)',
        example: 11,
    })
    month!: number;

    @ApiProperty({
        description: 'Number of invoices that became overdue in this month',
        example: 15,
    })
    count!: number;
}

export class OverdueMonthlyDto {
    @ApiProperty({
        description: 'Monthly overdue invoice statistics for the last 12 months',
        type: [OverdueMonthlyItemDto],
    })
    statistics!: OverdueMonthlyItemDto[];
}
