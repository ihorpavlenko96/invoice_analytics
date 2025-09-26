export const analyticsKeys = {
  all: ['analytics'] as const,
  summary: (filters?: { startDate?: string; endDate?: string; tenantId?: string }) =>
    [...analyticsKeys.all, 'summary', filters] as const,
  statusDistribution: (filters?: { startDate?: string; endDate?: string; tenantId?: string }) =>
    [...analyticsKeys.all, 'status-distribution', filters] as const,
  monthlyTrends: (filters?: { startDate?: string; endDate?: string; tenantId?: string }) =>
    [...analyticsKeys.all, 'monthly-trends', filters] as const,
  topVendors: (filters?: { startDate?: string; endDate?: string; tenantId?: string }) =>
    [...analyticsKeys.all, 'top-vendors', filters] as const,
  topCustomers: (filters?: { startDate?: string; endDate?: string; tenantId?: string }) =>
    [...analyticsKeys.all, 'top-customers', filters] as const,
};