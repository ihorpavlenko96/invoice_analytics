import axios from 'axios';
import { AnalyticsData, AnalyticsFilters, MonthlyData, StatusDistribution, TopVendor, TopCustomer } from '../types/analytics';

// Backend DTO interfaces
interface SummaryAnalyticsDto {
  totalInvoices: number;
  totalInvoicedAmount: number;
  totalOverdueAmount: number;
  totalPaidAmount: number;
  overdueCount: number;
  paidCount: number;
}

interface StatusDistributionItemDto {
  status: string;
  count: number;
  totalAmount: number;
}

interface StatusDistributionDto {
  distribution: StatusDistributionItemDto[];
}

interface MonthlyTrendItemDto {
  year: number;
  month: number;
  totalAmount: number;
  invoiceCount: number;
}

interface MonthlyTrendsDto {
  trends: MonthlyTrendItemDto[];
}

interface TopEntityItemDto {
  name: string;
  totalAmount: number;
  invoiceCount: number;
}

interface TopVendorsDto {
  topVendors: TopEntityItemDto[];
}

interface TopCustomersDto {
  topCustomers: TopEntityItemDto[];
}

// Data transformation utilities
const transformSummaryData = (summaryDto: SummaryAnalyticsDto) => {
  const activeInvoices = summaryDto.totalInvoices - summaryDto.paidCount - summaryDto.overdueCount;
  return {
    totalInvoices: summaryDto.totalInvoices,
    totalAmount: summaryDto.totalInvoicedAmount,
    activeInvoices,
    overdueInvoices: summaryDto.overdueCount,
  };
};

const transformStatusDistribution = (statusDto: StatusDistributionDto): StatusDistribution[] => {
  const totalCount = statusDto.distribution.reduce((sum, item) => sum + item.count, 0);

  return statusDto.distribution.map(item => ({
    status: item.status as 'PAID' | 'UNPAID' | 'OVERDUE',
    count: item.count,
    percentage: totalCount > 0 ? (item.count / totalCount) * 100 : 0,
    amount: item.totalAmount,
  }));
};

const transformMonthlyTrends = (trendsDto: MonthlyTrendsDto): MonthlyData[] => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return trendsDto.trends.map(trend => ({
    month: monthNames[trend.month - 1] || 'Unknown',
    year: trend.year,
    amount: trend.totalAmount,
    count: trend.invoiceCount,
  }));
};

const transformTopVendors = (vendorsDto: TopVendorsDto): TopVendor[] => {
  return vendorsDto.topVendors.map(vendor => ({
    vendorName: vendor.name,
    totalAmount: vendor.totalAmount,
    invoiceCount: vendor.invoiceCount,
  }));
};

const transformTopCustomers = (customersDto: TopCustomersDto): TopCustomer[] => {
  return customersDto.topCustomers.map(customer => ({
    customerName: customer.name,
    totalAmount: customer.totalAmount,
    invoiceCount: customer.invoiceCount,
  }));
};

export const analyticsService = {
  /**
   * Get summary analytics
   * @param filters - Optional filters for date range and tenant
   * @returns Promise<SummaryAnalyticsDto>
   */
  getSummaryAnalytics: async (filters?: AnalyticsFilters): Promise<SummaryAnalyticsDto> => {
    const response = await axios.get<SummaryAnalyticsDto>('/analytics/summary', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get status distribution analytics
   * @param filters - Optional filters for date range and tenant
   * @returns Promise<StatusDistributionDto>
   */
  getStatusDistribution: async (filters?: AnalyticsFilters): Promise<StatusDistributionDto> => {
    const response = await axios.get<StatusDistributionDto>('/analytics/status-distribution', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get monthly trends analytics
   * @param filters - Optional filters for date range and tenant
   * @returns Promise<MonthlyTrendsDto>
   */
  getMonthlyTrends: async (filters?: AnalyticsFilters): Promise<MonthlyTrendsDto> => {
    const response = await axios.get<MonthlyTrendsDto>('/analytics/monthly-trends', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get top vendors analytics
   * @param filters - Optional filters for date range and tenant
   * @returns Promise<TopVendorsDto>
   */
  getTopVendors: async (filters?: AnalyticsFilters): Promise<TopVendorsDto> => {
    const response = await axios.get<TopVendorsDto>('/analytics/top-vendors', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get top customers analytics
   * @param filters - Optional filters for date range and tenant
   * @returns Promise<TopCustomersDto>
   */
  getTopCustomers: async (filters?: AnalyticsFilters): Promise<TopCustomersDto> => {
    const response = await axios.get<TopCustomersDto>('/analytics/top-customers', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get all analytics data combined
   * @param filters - Optional filters for date range and tenant
   * @returns Promise<AnalyticsData>
   */
  getAnalytics: async (filters?: AnalyticsFilters): Promise<AnalyticsData> => {
    try {
      const [summaryData, statusData, trendsData, vendorsData, customersData] = await Promise.all([
        analyticsService.getSummaryAnalytics(filters),
        analyticsService.getStatusDistribution(filters),
        analyticsService.getMonthlyTrends(filters),
        analyticsService.getTopVendors(filters),
        analyticsService.getTopCustomers(filters),
      ]);

      return {
        summary: transformSummaryData(summaryData),
        monthlyData: transformMonthlyTrends(trendsData),
        statusDistribution: transformStatusDistribution(statusData),
        topVendors: transformTopVendors(vendorsData),
        topCustomers: transformTopCustomers(customersData),
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  },
};