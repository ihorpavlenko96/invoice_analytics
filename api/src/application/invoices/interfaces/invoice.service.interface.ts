import { InvoiceDto } from '../dto/invoice.dto';
import { PaginatedResponseDto, ExportFiltersDto } from '../dto/pagination.dto';
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
     * Export all matching invoices to an Excel buffer.
     * No pagination is applied — every invoice that matches the supplied
     * filters is included in the exported file.
     */
    exportToExcel(tenantId: string, filters?: ExportFiltersDto): Promise<Buffer>;

    archiveInvoices(ids: string[], tenantId: string): Promise<void>;

    unarchiveInvoices(ids: string[], tenantId: string): Promise<void>;
}
