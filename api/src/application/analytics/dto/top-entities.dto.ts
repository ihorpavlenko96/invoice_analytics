import { ApiProperty } from '@nestjs/swagger';

export class TopEntityItemDto {
    @ApiProperty({
        description: 'Entity name (vendor or customer)',
        example: 'Acme Corporation',
    })
    name!: string;

    @ApiProperty({
        description: 'Total amount for this entity',
        example: 45000.50,
    })
    totalAmount!: number;

    @ApiProperty({
        description: 'Number of invoices for this entity',
        example: 12,
    })
    invoiceCount!: number;
}

export class TopVendorsDto {
    @ApiProperty({
        description: 'Top 5 vendors by invoice amount',
        type: [TopEntityItemDto],
    })
    topVendors!: TopEntityItemDto[];
}

export class TopCustomersDto {
    @ApiProperty({
        description: 'Top 5 customers by invoice amount',
        type: [TopEntityItemDto],
    })
    topCustomers!: TopEntityItemDto[];
}