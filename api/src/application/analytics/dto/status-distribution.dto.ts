import { ApiProperty } from '@nestjs/swagger';

export class StatusDistributionItemDto {
    @ApiProperty({
        description: 'Invoice status',
        example: 'PAID',
    })
    status!: string;

    @ApiProperty({
        description: 'Number of invoices with this status',
        example: 85,
    })
    count!: number;

    @ApiProperty({
        description: 'Total amount for this status',
        example: 85000.5,
    })
    totalAmount!: number;
}

export class StatusDistributionDto {
    @ApiProperty({
        description: 'Distribution of invoices by status',
        type: [StatusDistributionItemDto],
    })
    distribution!: StatusDistributionItemDto[];
}
