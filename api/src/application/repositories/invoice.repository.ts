import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../domain/entities/invoice.entity';
import { PaginationParamsDto } from '../invoices/dto/pagination.dto';
import { AnalyticsFiltersDto } from '../analytics/dto/analytics-filters.dto';

@Injectable()
export class InvoiceRepository {
    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
    ) {}

    async findAll(
        tenantId: string,
        paginationParams: PaginationParamsDto,
    ): Promise<[Invoice[], number]> {
        const page = paginationParams.page ?? 1;
        const limit = paginationParams.limit ?? 10;
        const skip = (page - 1) * limit;

        // Build query with QueryBuilder for search support
        const queryBuilder = this.invoiceRepository.createQueryBuilder('invoice')
            .where('invoice.tenantId = :tenantId', { tenantId });

        // Apply status filter if provided
        if (paginationParams.status) {
            queryBuilder.andWhere('invoice.status = :status', { status: paginationParams.status });
        }

        // By default, exclude archived invoices unless explicitly requested
        if (!paginationParams.includeArchived) {
            queryBuilder.andWhere('invoice.isArchived = :isArchived', { isArchived: false });
        }

        // Apply search filter if provided
        if (paginationParams.search && paginationParams.search.trim()) {
            const searchTerm = `%${paginationParams.search.toLowerCase()}%`;
            queryBuilder.andWhere(
                '(LOWER(invoice.vendorName) LIKE :search OR LOWER(invoice.customerName) LIKE :search)',
                { search: searchTerm }
            );
        }

        // Apply ordering
        queryBuilder.orderBy('invoice.issueDate', 'DESC');

        // Apply pagination
        queryBuilder.skip(skip).take(limit);

        return queryBuilder.getManyAndCount();
    }

    async findById(id: string, tenantId: string): Promise<Invoice | null> {
        return this.invoiceRepository.findOne({
            where: { id, tenantId },
            relations: ['items'],
        });
    }

    async save(invoice: Invoice): Promise<Invoice> {
        return this.invoiceRepository.save(invoice);
    }

    async remove(id: string, tenantId: string): Promise<void> {
        await this.invoiceRepository.delete(id);
    }

    async archiveInvoices(ids: string[], tenantId: string): Promise<void> {
        await this.invoiceRepository
            .createQueryBuilder()
            .update(Invoice)
            .set({ isArchived: true })
            .where('id IN (:...ids)', { ids })
            .andWhere('tenantId = :tenantId', { tenantId })
            .execute();
    }

    async unarchiveInvoices(ids: string[], tenantId: string): Promise<void> {
        await this.invoiceRepository
            .createQueryBuilder()
            .update(Invoice)
            .set({ isArchived: false })
            .where('id IN (:...ids)', { ids })
            .andWhere('tenantId = :tenantId', { tenantId })
            .execute();
    }

    async getSummaryAnalytics(tenantId: string, filters?: AnalyticsFiltersDto) {
        const query = this.invoiceRepository.createQueryBuilder('invoice')
            .select([
                'COUNT(invoice.id) as totalInvoices',
                'SUM(invoice.totalAmount) as totalInvoicedAmount',
                'SUM(CASE WHEN invoice.status = \'PAID\' THEN invoice.totalAmount ELSE 0 END) as totalPaidAmount',
                'SUM(CASE WHEN invoice.dueDate < CURRENT_DATE AND invoice.status != \'PAID\' THEN invoice.totalAmount ELSE 0 END) as totalOverdueAmount',
                'COUNT(CASE WHEN invoice.status = \'PAID\' THEN 1 END) as paidCount',
                'COUNT(CASE WHEN invoice.dueDate < CURRENT_DATE AND invoice.status != \'PAID\' THEN 1 END) as overdueCount'
            ])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.isArchived = :isArchived', { isArchived: false });

        if (filters?.from) {
            query.andWhere('invoice.issueDate >= :from', { from: filters.from });
        }
        if (filters?.to) {
            query.andWhere('invoice.issueDate <= :to', { to: filters.to });
        }

        return query.getRawOne();
    }

    async getStatusDistribution(tenantId: string, filters?: AnalyticsFiltersDto) {
        const query = this.invoiceRepository.createQueryBuilder('invoice')
            .select([
                'invoice.status as status',
                'COUNT(invoice.id) as count',
                'SUM(invoice.totalAmount) as totalAmount'
            ])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.isArchived = :isArchived', { isArchived: false });

        if (filters?.from) {
            query.andWhere('invoice.issueDate >= :from', { from: filters.from });
        }
        if (filters?.to) {
            query.andWhere('invoice.issueDate <= :to', { to: filters.to });
        }

        return query
            .groupBy('invoice.status')
            .orderBy('totalAmount', 'DESC')
            .getRawMany();
    }

    async getMonthlyTrends(tenantId: string, filters?: AnalyticsFiltersDto) {
        const query = this.invoiceRepository.createQueryBuilder('invoice')
            .select([
                'EXTRACT(YEAR FROM invoice.issueDate) as year',
                'EXTRACT(MONTH FROM invoice.issueDate) as month',
                'SUM(invoice.totalAmount) as totalAmount',
                'COUNT(invoice.id) as invoiceCount'
            ])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.isArchived = :isArchived', { isArchived: false });

        if (filters?.from) {
            query.andWhere('invoice.issueDate >= :from', { from: filters.from });
        }
        if (filters?.to) {
            query.andWhere('invoice.issueDate <= :to', { to: filters.to });
        }

        return query
            .groupBy('EXTRACT(YEAR FROM invoice.issueDate), EXTRACT(MONTH FROM invoice.issueDate)')
            .orderBy('year', 'DESC')
            .addOrderBy('month', 'DESC')
            .getRawMany();
    }

    async getTopVendors(tenantId: string, filters?: AnalyticsFiltersDto) {
        const query = this.invoiceRepository.createQueryBuilder('invoice')
            .select([
                'invoice.vendorName as name',
                'SUM(invoice.totalAmount) as totalAmount',
                'COUNT(invoice.id) as invoiceCount'
            ])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.isArchived = :isArchived', { isArchived: false });

        if (filters?.from) {
            query.andWhere('invoice.issueDate >= :from', { from: filters.from });
        }
        if (filters?.to) {
            query.andWhere('invoice.issueDate <= :to', { to: filters.to });
        }

        return query
            .groupBy('invoice.vendorName')
            .orderBy('totalAmount', 'DESC')
            .limit(5)
            .getRawMany();
    }

    async getTopCustomers(tenantId: string, filters?: AnalyticsFiltersDto) {
        const query = this.invoiceRepository.createQueryBuilder('invoice')
            .select([
                'invoice.customerName as name',
                'SUM(invoice.totalAmount) as totalAmount',
                'COUNT(invoice.id) as invoiceCount'
            ])
            .where('invoice.tenantId = :tenantId', { tenantId })
            .andWhere('invoice.isArchived = :isArchived', { isArchived: false });

        if (filters?.from) {
            query.andWhere('invoice.issueDate >= :from', { from: filters.from });
        }
        if (filters?.to) {
            query.andWhere('invoice.issueDate <= :to', { to: filters.to });
        }

        return query
            .groupBy('invoice.customerName')
            .orderBy('totalAmount', 'DESC')
            .limit(5)
            .getRawMany();
    }
}
