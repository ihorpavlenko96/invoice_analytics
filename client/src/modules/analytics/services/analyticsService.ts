// import axios from 'axios';
import { AnalyticsData, AnalyticsFilters } from '../types/analytics';

// Mock data for development until backend endpoints are ready
const generateMockData = (): AnalyticsData => {
  const currentDate = new Date();
  const monthlyData = [];

  // Generate last 12 months of data
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    monthlyData.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      amount: Math.floor(Math.random() * 100000) + 50000,
      count: Math.floor(Math.random() * 50) + 10,
    });
  }

  const totalInvoices = 1247;
  const activeInvoices = 342;
  const overdueInvoices = 89;
  const totalAmount = 2847392.50;

  return {
    summary: {
      totalInvoices,
      totalAmount,
      activeInvoices,
      overdueInvoices,
    },
    monthlyData,
    statusDistribution: [
      { status: 'PAID', count: 816, percentage: 65.4, amount: 1856743.20 },
      { status: 'UNPAID', count: 342, percentage: 27.4, amount: 867294.30 },
      { status: 'OVERDUE', count: 89, percentage: 7.2, amount: 123355.00 },
    ],
    topVendors: [
      { vendorName: 'TechCorp Solutions', totalAmount: 485293.50, invoiceCount: 127 },
      { vendorName: 'Global Services Inc', totalAmount: 342857.25, invoiceCount: 89 },
      { vendorName: 'Digital Systems Ltd', totalAmount: 298476.80, invoiceCount: 76 },
      { vendorName: 'Innovation Partners', totalAmount: 267843.15, invoiceCount: 63 },
      { vendorName: 'Future Technologies', totalAmount: 234567.90, invoiceCount: 54 },
    ],
    topCustomers: [
      { customerName: 'Enterprise Corp', totalAmount: 623847.30, invoiceCount: 156 },
      { customerName: 'MegaBusiness Ltd', totalAmount: 498273.45, invoiceCount: 134 },
      { customerName: 'Corporate Solutions', totalAmount: 387659.20, invoiceCount: 98 },
      { customerName: 'Business Dynamics', totalAmount: 334829.65, invoiceCount: 87 },
      { customerName: 'Global Enterprises', totalAmount: 298574.80, invoiceCount: 72 },
    ],
  };
};

export const analyticsService = {
  /**
   * Get analytics data with optional filters
   * @param filters - Optional filters for date range and tenant
   * @returns Promise<AnalyticsData>
   */
  getAnalytics: async (filters?: AnalyticsFilters): Promise<AnalyticsData> => {
    // TODO: Replace with actual API call when backend is ready
    // const response = await axios.get<AnalyticsData>('/analytics', {
    //   params: filters,
    // });
    // return response.data;

    // For now, return mock data with a delay to simulate API call
    // TODO: Use filters parameter when implementing real API call
    console.log('Analytics filters:', filters);
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockData();
  },
};