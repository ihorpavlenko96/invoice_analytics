export interface AnalyticsSummary {
  totalInvoices: number;
  totalAmount: number;
  activeInvoices: number;
  overdueInvoices: number;
}

export interface MonthlyData {
  month: string;
  year: number;
  amount: number;
  count: number;
}

export interface StatusDistribution {
  status: 'PAID' | 'UNPAID' | 'OVERDUE';
  count: number;
  percentage: number;
  amount: number;
}

export interface TopVendor {
  vendorName: string;
  totalAmount: number;
  invoiceCount: number;
}

export interface TopCustomer {
  customerName: string;
  totalAmount: number;
  invoiceCount: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  monthlyData: MonthlyData[];
  statusDistribution: StatusDistribution[];
  topVendors: TopVendor[];
  topCustomers: TopCustomer[];
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  tenantId?: string;
}