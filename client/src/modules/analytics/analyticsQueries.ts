import { useQuery } from '@tanstack/react-query';
import { analyticsKeys } from './analyticsQueryKeys';
import { analyticsService } from './services/analyticsService';
import { AnalyticsFilters } from './types/analytics';

/**
 * Hook to fetch summary analytics
 * @param filters - Optional filters for date range and tenant
 */
export const useSummaryAnalytics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.summary(filters),
    queryFn: () => analyticsService.getSummaryAnalytics(filters),
  });
};

/**
 * Hook to fetch status distribution analytics
 * @param filters - Optional filters for date range and tenant
 */
export const useStatusDistribution = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.statusDistribution(filters),
    queryFn: () => analyticsService.getStatusDistribution(filters),
  });
};

/**
 * Hook to fetch monthly trends analytics
 * @param filters - Optional filters for date range and tenant
 */
export const useMonthlyTrends = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.monthlyTrends(filters),
    queryFn: () => analyticsService.getMonthlyTrends(filters),
  });
};

/**
 * Hook to fetch top vendors analytics
 * @param filters - Optional filters for date range and tenant
 */
export const useTopVendors = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.topVendors(filters),
    queryFn: () => analyticsService.getTopVendors(filters),
  });
};

/**
 * Hook to fetch top customers analytics
 * @param filters - Optional filters for date range and tenant
 */
export const useTopCustomers = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.topCustomers(filters),
    queryFn: () => analyticsService.getTopCustomers(filters),
  });
};

/**
 * Hook to fetch all analytics data combined
 * @param filters - Optional filters for date range and tenant
 */
export const useAnalytics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: analyticsKeys.all,
    queryFn: () => analyticsService.getAnalytics(filters),
  });
};