import { InvoiceDto } from '../dto/invoice.dto';
import { PaginatedResponseDto } from '../dto/pagination.dto';
import { PaginationParamsDto } from '../dto/pagination.dto';
import { ExportParamsDto } from '../dto/export-params.dto';

export const INVOICE_SERVICE = 'INVOICE_SERVICE';

export interface IInvoiceService {
    findAll(
        tenantId: string,
        paginationParams: PaginationParamsDto,
    ): Promise<PaginatedResponseDto<InvoiceDto>>;

    findById(id: string, tenantId: string): Promise<InvoiceDto>;

    importFromBuffer(buffer: Buffer, tenantId: string): Promise<InvoiceDto>;

    remove(id: string, tenantId: string): Promise<void>;

    exportToExcel(tenantId: string, exportParams: ExportParamsDto): Promise<Buffer>;

    archiveInvoices(ids: string[], tenantId: string): Promise<void>;

    unarchiveInvoices(ids: string[], tenantId: string): Promise<void>;
}
