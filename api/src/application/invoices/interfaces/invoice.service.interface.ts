import { InvoiceDto } from '../dto/invoice.dto';
import { PaginatedResponseDto } from '../dto/pagination.dto';
import { PaginationParamsDto } from '../dto/pagination.dto';

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
     * Exports ALL invoices for the given tenant to an Excel buffer.
     * Pagination, status filters, and archive state are intentionally ignored so that
     * the exported file always reflects the complete dataset.
     */
    exportToExcel(tenantId: string): Promise<Buffer>;

    archiveInvoices(ids: string[], tenantId: string): Promise<void>;

    unarchiveInvoices(ids: string[], tenantId: string): Promise<void>;
}
