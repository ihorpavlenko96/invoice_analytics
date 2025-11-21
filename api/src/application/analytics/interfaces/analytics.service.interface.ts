import { AnalyticsFiltersDto } from '../dto/analytics-filters.dto';
import { SummaryAnalyticsDto } from '../dto/summary-analytics.dto';
import { StatusDistributionDto } from '../dto/status-distribution.dto';
import { MonthlyTrendsDto } from '../dto/monthly-trends.dto';
import { TopVendorsDto, TopCustomersDto } from '../dto/top-entities.dto';
import { OverdueMonthlyDto } from '../dto/overdue-monthly.dto';

export const ANALYTICS_SERVICE = 'ANALYTICS_SERVICE';

export interface IAnalyticsService {
    getSummaryAnalytics(tenantId: string, filters?: AnalyticsFiltersDto): Promise<SummaryAnalyticsDto>;
    getStatusDistribution(tenantId: string, filters?: AnalyticsFiltersDto): Promise<StatusDistributionDto>;
    getMonthlyTrends(tenantId: string, filters?: AnalyticsFiltersDto): Promise<MonthlyTrendsDto>;
    getTopVendors(tenantId: string, filters?: AnalyticsFiltersDto): Promise<TopVendorsDto>;
    getTopCustomers(tenantId: string, filters?: AnalyticsFiltersDto): Promise<TopCustomersDto>;
    getOverdueMonthlyStatistics(tenantId: string): Promise<OverdueMonthlyDto>;
}