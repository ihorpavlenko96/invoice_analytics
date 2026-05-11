import { InvoiceDto } from '../dto/invoice.dto';
import { PaginatedResponseDto } from '../dto/pagination.dto';
import { PaginationParamsDto } from '../dto/pagination.dto';
import { ExportFiltersDto } from '../dto/export-filters.dto';

export const INVOICE_SERVICE = 'INVOICE_SERVICE';

export interface IInvoiceService {
    findAll(
        tenantId: string,
        paginationParams: PaginationParamsDto,
    ): Promise<PaginatedResponseDto<InvoiceDto>>;

    findById(id: string, tenantId: string): Promise<InvoiceDto>;

    importFromBuffer(buffer: Buffer, tenantId: string): Promise<InvoiceDto>;

    remove(id: string, tenantId: string): Promise<void>;

    /**
     * Exports ALL invoices (no pagination) for the given tenant to an Excel buffer.
     * Optional status and includeArchived filters are still respected.
     */
    exportToExcel(tenantId: string, filters: ExportFiltersDto): Promise<Buffer>;

    archiveInvoices(ids: string[], tenantId: string): Promise<void>;

    unarchiveInvoices(ids: string[], tenantId: string): Promise<void>;
}
