import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

export const analyticsKeys = {
  all: ['analytics'] as const,
  overdueMonthly: () => [...analyticsKeys.all, 'overdue-monthly'] as const,
};

export const useOverdueMonthlyStatistics = () => {
  return useQuery({
    queryKey: analyticsKeys.overdueMonthly(),
    queryFn: () => analyticsService.getOverdueMonthlyStatistics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
