import { InvoiceDto } from '../dto/invoice.dto';
import { ExportInvoicesParamsDto, PaginatedResponseDto, PaginationParamsDto } from '../dto/pagination.dto';

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
     * Exports all invoices matching the given filters to an Excel buffer.
     * Pagination is deliberately bypassed — all matching records are included.
     */
    exportToExcel(tenantId: string, exportParams: ExportInvoicesParamsDto): Promise<Buffer>;

    archiveInvoices(ids: string[], tenantId: string): Promise<void>;

    unarchiveInvoices(ids: string[], tenantId: string): Promise<void>;
}
