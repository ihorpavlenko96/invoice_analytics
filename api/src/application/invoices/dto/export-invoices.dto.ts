import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * Query parameters for GET /invoices/export/excel.
 *
 * Intentionally has NO page/limit/status: the export always covers the tenant's
 * complete invoice set. The global ValidationPipe runs with forbidNonWhitelisted,
 * so sending page/limit/status here yields a 400.
 */
export class ExportInvoicesParamsDto {
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
