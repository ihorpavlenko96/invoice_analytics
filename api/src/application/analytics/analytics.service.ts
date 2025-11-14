import { Injectable } from '@nestjs/common';
import { IAnalyticsService } from './interfaces/analytics.service.interface';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { AnalyticsFiltersDto } from './dto/analytics-filters.dto';
import { SummaryAnalyticsDto } from './dto/summary-analytics.dto';
import { StatusDistributionDto } from './dto/status-distribution.dto';
import { MonthlyTrendsDto } from './dto/monthly-trends.dto';
import { TopVendorsDto, TopCustomersDto } from './dto/top-entities.dto';
import { OverdueMonthlyDto } from './dto/overdue-monthly.dto';

@Injectable()
export class AnalyticsService implements IAnalyticsService {
    constructor(private readonly invoiceRepository: InvoiceRepository) {}

    async getSummaryAnalytics(tenantId: string, filters?: AnalyticsFiltersDto): Promise<SummaryAnalyticsDto> {
        const result = await this.invoiceRepository.getSummaryAnalytics(tenantId, filters);

        return {
            totalInvoices: parseInt(result.totalInvoices) || 0,
            totalInvoicedAmount: parseFloat(result.totalInvoicedAmount) || 0,
            totalPaidAmount: parseFloat(result.totalPaidAmount) || 0,
            totalOverdueAmount: parseFloat(result.totalOverdueAmount) || 0,
            paidCount: parseInt(result.paidCount) || 0,
            overdueCount: parseInt(result.overdueCount) || 0,
        };
    }

    async getStatusDistribution(tenantId: string, filters?: AnalyticsFiltersDto): Promise<StatusDistributionDto> {
        const results = await this.invoiceRepository.getStatusDistribution(tenantId, filters);

        return {
            distribution: results.map(result => ({
                status: result.status,
                count: parseInt(result.count) || 0,
                totalAmount: parseFloat(result.totalAmount) || 0,
            })),
        };
    }

    async getMonthlyTrends(tenantId: string, filters?: AnalyticsFiltersDto): Promise<MonthlyTrendsDto> {
        const results = await this.invoiceRepository.getMonthlyTrends(tenantId, filters);

        return {
            trends: results.map(result => ({
                year: parseInt(result.year),
                month: parseInt(result.month),
                totalAmount: parseFloat(result.totalAmount) || 0,
                invoiceCount: parseInt(result.invoiceCount) || 0,
            })),
        };
    }

    async getTopVendors(tenantId: string, filters?: AnalyticsFiltersDto): Promise<TopVendorsDto> {
        const results = await this.invoiceRepository.getTopVendors(tenantId, filters);

        return {
            topVendors: results.map(result => ({
                name: result.name,
                totalAmount: parseFloat(result.totalAmount) || 0,
                invoiceCount: parseInt(result.invoiceCount) || 0,
            })),
        };
    }

    async getTopCustomers(tenantId: string, filters?: AnalyticsFiltersDto): Promise<TopCustomersDto> {
        const results = await this.invoiceRepository.getTopCustomers(tenantId, filters);

        return {
            topCustomers: results.map(result => ({
                name: result.name,
                totalAmount: parseFloat(result.totalAmount) || 0,
                invoiceCount: parseInt(result.invoiceCount) || 0,
            })),
        };
    }

    async getOverdueMonthlyStatistics(tenantId: string): Promise<OverdueMonthlyDto> {
        const results = await this.invoiceRepository.getOverdueMonthlyStatistics(tenantId);

        return {
            statistics: results.map(result => ({
                year: parseInt(result.year),
                month: parseInt(result.month),
                count: parseInt(result.count) || 0,
            })),
        };
    }
}