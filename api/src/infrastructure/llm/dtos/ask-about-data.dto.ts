import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class AskAboutDataDto {
    @ApiProperty({
        description: 'The query to ask about data',
        example: 'Show me sales data for the last quarter',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    query: string;

    @ApiProperty({
        description: 'Previous conversation context for follow-up questions',
        example: [
            { query: 'Show me all invoices', sql: 'SELECT * FROM invoices' },
        ],
        required: false,
        type: 'array',
        items: {
            type: 'object',
            properties: {
                query: { type: 'string' },
                sql: { type: 'string' },
            },
        },
    })
    @IsOptional()
    @IsArray()
    conversationContext?: Array<{ query: string; sql: string }>;
}
