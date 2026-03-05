import { InvoiceDto } from '../dto/invoice.dto';
import { PaginatedResponseDto, PaginationParamsDto } from '../dto/pagination.dto';
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

    exportToExcel(tenantId: string, filters: ExportFiltersDto): Promise<Buffer>;

    archiveInvoices(ids: string[], tenantId: string): Promise<void>;

    unarchiveInvoices(ids: string[], tenantId: string): Promise<void>;
}
