import axios from 'axios';

export interface OverdueMonthlyItem {
  year: number;
  month: number;
  count: number;
}

export interface OverdueMonthlyStatistics {
  statistics: OverdueMonthlyItem[];
}

export const analyticsService = {
  /**
   * Get monthly overdue statistics for the last 12 months
   * @returns Promise<OverdueMonthlyStatistics>
   */
  getOverdueMonthlyStatistics: async (): Promise<OverdueMonthlyStatistics> => {
    const response = await axios.get<OverdueMonthlyStatistics>('/analytics/overdue-monthly');
    return response.data;
  },
};
