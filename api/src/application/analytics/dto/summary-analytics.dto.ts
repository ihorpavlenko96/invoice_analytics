import { ApiProperty } from '@nestjs/swagger';

export class SummaryAnalyticsDto {
    @ApiProperty({
        description: 'Total number of invoices',
        example: 150,
    })
    totalInvoices!: number;

    @ApiProperty({
        description: 'Total invoiced amount across all invoices',
        example: 125000.5,
    })
    totalInvoicedAmount!: number;

    @ApiProperty({
        description: 'Total amount of overdue invoices',
        example: 15000.0,
    })
    totalOverdueAmount!: number;

    @ApiProperty({
        description: 'Total amount of paid invoices',
        example: 85000.5,
    })
    totalPaidAmount!: number;

    @ApiProperty({
        description: 'Number of overdue invoices',
        example: 12,
    })
    overdueCount!: number;

    @ApiProperty({
        description: 'Number of paid invoices',
        example: 85,
    })
    paidCount!: number;
}
