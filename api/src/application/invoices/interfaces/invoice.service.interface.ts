import { InvoiceDto } from '../dto/invoice.dto';
import { PaginatedResponseDto, PaginationParamsDto, ExportFiltersDto } from '../dto/pagination.dto';

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
     * Exports all invoices (ignoring pagination) for the given tenant to an
     * Excel buffer.  Optional filters (status, includeArchived) may be applied
     * to narrow the result set.
     */
    exportToExcel(tenantId: string, filters?: ExportFiltersDto): Promise<Buffer>;

    archiveInvoices(ids: string[], tenantId: string): Promise<void>;

    unarchiveInvoices(ids: string[], tenantId: string): Promise<void>;
}
