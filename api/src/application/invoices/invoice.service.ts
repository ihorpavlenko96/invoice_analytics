import { Injectable, NotFoundException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { IInvoiceService } from './interfaces/invoice.service.interface';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { InvoiceMapper } from './invoice.mapper';
import { InvoiceDto } from './dto/invoice.dto';
import { PaginatedResponseDto, PaginationParamsDto } from './dto/pagination.dto';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceItem } from '../../domain/entities/invoice-item.entity';

@Injectable()
export class InvoiceService implements IInvoiceService {
    constructor(
        private readonly invoiceRepository: InvoiceRepository,
        private readonly invoiceMapper: InvoiceMapper,
    ) {}

    async findAll(
        tenantId: string,
        paginationParams: PaginationParamsDto,
    ): Promise<PaginatedResponseDto<InvoiceDto>> {
        const [invoices, total] = await this.invoiceRepository.findAll(tenantId, paginationParams);

        return this.invoiceMapper.toPaginatedResponse(
            invoices,
            total,
            paginationParams.page ?? 1,
            paginationParams.limit ?? 10,
        );
    }

    async findById(id: string, tenantId: string): Promise<InvoiceDto> {
        const invoice = await this.invoiceRepository.findById(id, tenantId);

        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }

        return this.invoiceMapper.toDto(invoice);
    }

    async importFromBuffer(buffer: Buffer, tenantId: string): Promise<InvoiceDto> {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const sheet = workbook.worksheets[0]; // or by name

        const inv = new Invoice();
        inv.invoiceNumber = this.getCellText(sheet, 'D10');

        // Parse dates properly to ensure they're in YYYY-MM-DD format
        const issueDateValue = sheet.getCell('D11').value;
        inv.issueDate = this.formatDateValue(issueDateValue);

        const dueDateValue = sheet.getCell('D12').value;
        inv.dueDate = this.formatDateValue(dueDateValue);

        inv.vendorName = this.getCellText(sheet, 'G2');
        inv.vendorAddress = this.getCellText(sheet, 'G3');
        inv.vendorPhone = this.getCellText(sheet, 'G5');
        inv.vendorEmail = this.getCellText(sheet, 'G6');
        inv.customerName = this.getCellText(sheet, 'G10');
        inv.customerAddress = this.getCellText(sheet, 'G11');
        inv.customerPhone = this.getCellText(sheet, 'G12');
        inv.customerEmail = this.getCellText(sheet, 'G13');

        // parse items starting row 17 until blank
        const items: InvoiceItem[] = [];
        let rowIndex = 17;
        while (true) {
            const row = sheet.getRow(rowIndex);
            const ln = this.getCellValue(row, 3);
            if (!ln) break;

            const item = new InvoiceItem();
            item.lineNumber = Number(ln);
            item.description = this.getCellText(row, 4);
            item.quantity = Number(this.getCellValue(row, 5));
            item.unitPrice = Number(this.getCellValue(row, 6));
            item.amount = Number(this.getCellValue(row, 7));
            items.push(item);
            rowIndex++;
        }
        inv.items = items;

        // parse totals (assumes fixed offsets)
        inv.subtotal = Number(this.getCellValue(sheet, rowIndex, 7));
        inv.discount = Number(this.getCellValue(sheet, rowIndex + 1, 7));
        inv.taxRate = Number(this.getCellValue(sheet, rowIndex + 2, 7));
        inv.taxAmount = Number(this.getCellValue(sheet, rowIndex + 3, 7));
        inv.totalAmount = inv.subtotal - inv.discount + inv.taxAmount;
        inv.tenantId = tenantId;

        const savedInvoice = await this.invoiceRepository.save(inv);
        return this.invoiceMapper.toDto(savedInvoice);
    }

    async remove(id: string, tenantId: string): Promise<void> {
        const invoice = await this.invoiceRepository.findById(id, tenantId);

        if (!invoice) {
            throw new NotFoundException(`Invoice with ID ${id} not found`);
        }

        await this.invoiceRepository.remove(id, tenantId);
    }

    async exportToExcel(
        tenantId: string,
        paginationParams: PaginationParamsDto,
    ): Promise<Buffer> {
        // Export all invoices regardless of pagination parameters
        const invoices = await this.invoiceRepository.findAllUnpaginated(tenantId);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Invoices');

        // Define columns
        worksheet.columns = [
            { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
            { header: 'Issue Date', key: 'issueDate', width: 15 },
            { header: 'Due Date', key: 'dueDate', width: 15 },
            { header: 'Vendor Name', key: 'vendorName', width: 25 },
            { header: 'Vendor Address', key: 'vendorAddress', width: 30 },
            { header: 'Vendor Phone', key: 'vendorPhone', width: 15 },
            { header: 'Vendor Email', key: 'vendorEmail', width: 25 },
            { header: 'Customer Name', key: 'customerName', width: 25 },
            { header: 'Customer Address', key: 'customerAddress', width: 30 },
            { header: 'Customer Phone', key: 'customerPhone', width: 15 },
            { header: 'Customer Email', key: 'customerEmail', width: 25 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Currency', key: 'currency', width: 10 },
            { header: 'Subtotal', key: 'subtotal', width: 12 },
            { header: 'Discount', key: 'discount', width: 12 },
            { header: 'Tax Rate', key: 'taxRate', width: 12 },
            { header: 'Tax Amount', key: 'taxAmount', width: 12 },
            { header: 'Total Amount', key: 'totalAmount', width: 15 },
            { header: 'Terms', key: 'terms', width: 30 },
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };

        // Add data rows
        invoices.forEach((invoice) => {
            worksheet.addRow({
                invoiceNumber: invoice.invoiceNumber,
                issueDate: invoice.issueDate,
                dueDate: invoice.dueDate,
                vendorName: invoice.vendorName,
                vendorAddress: invoice.vendorAddress,
                vendorPhone: invoice.vendorPhone,
                vendorEmail: invoice.vendorEmail,
                customerName: invoice.customerName,
                customerAddress: invoice.customerAddress,
                customerPhone: invoice.customerPhone,
                customerEmail: invoice.customerEmail,
                status: invoice.status || 'N/A',
                currency: invoice.currency || 'USD',
                subtotal: invoice.subtotal,
                discount: invoice.discount,
                taxRate: invoice.taxRate,
                taxAmount: invoice.taxAmount,
                totalAmount: invoice.totalAmount,
                terms: invoice.terms || '',
            });
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    private formatDateValue(dateValue: ExcelJS.CellValue): string {
        if (!dateValue) return '';

        if (dateValue instanceof Date) {
            return dateValue.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }

        // Try to parse string dates
        if (typeof dateValue === 'string') {
            try {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }
                return dateValue;
            } catch (e) {
                return dateValue;
            }
        }

        if (typeof dateValue === 'number') {
            return String(dateValue);
        }

        if (typeof dateValue === 'boolean') {
            return dateValue ? '1' : '0';
        }

        // Handle Excel's rich text objects
        if (typeof dateValue === 'object' && dateValue !== null) {
            if ('text' in dateValue && typeof dateValue.text === 'string') {
                return dateValue.text;
            }
            if (
                'result' in dateValue &&
                (typeof dateValue.result === 'string' || typeof dateValue.result === 'number')
            ) {
                return String(dateValue.result);
            }
            // Don't use default stringification
            return '';
        }

        // If we reached here, we don't know how to handle the value, so return empty string
        return '';
    }

    private getCellText(
        sheetOrRow: ExcelJS.Worksheet | ExcelJS.Row,
        cellRef: string | number,
    ): string {
        try {
            if ('getCell' in sheetOrRow) {
                const cell = sheetOrRow.getCell(cellRef);
                return cell?.text || '';
            }
            return '';
        } catch (_error) {
            return '';
        }
    }

    private getCellValue(
        sheetOrRow: ExcelJS.Worksheet | ExcelJS.Row,
        rowOrColumn: number,
        column?: number,
    ): string | number | null {
        try {
            let cellValue: ExcelJS.CellValue | undefined;

            if (column !== undefined && 'getRow' in sheetOrRow) {
                // It's a worksheet and we want to get a specific row and column
                const row = sheetOrRow.getRow(rowOrColumn);
                cellValue = row.getCell(column).value;
            } else if ('getCell' in sheetOrRow) {
                // It's a row
                cellValue = sheetOrRow.getCell(rowOrColumn).value;
            }

            return this.formatCellValue(cellValue);
        } catch (_error) {
            return null;
        }
    }

    private formatCellValue(value: ExcelJS.CellValue | undefined): string | number | null {
        if (value === undefined || value === null) {
            return null;
        }

        // Handle different cell value types
        if (typeof value === 'number') {
            return value;
        } else if (typeof value === 'string') {
            return value;
        } else if (typeof value === 'boolean') {
            return value ? '1' : '0';
        } else if (value instanceof Date) {
            return value.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        } else if (typeof value === 'object') {
            // Handle rich text or other object types
            if ('text' in value && typeof value.text === 'string') {
                return value.text;
            }
            if (
                'result' in value &&
                (typeof value.result === 'number' || typeof value.result === 'string')
            ) {
                return value.result;
            }
            return JSON.stringify(value);
        }

        return String(value);
    }
}
