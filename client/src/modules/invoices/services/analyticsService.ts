import axios from 'axios';
import { MonthlyTrendsResponse } from '../types/analytics';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const analyticsService = {
  /**
   * Fetch monthly trends data from the analytics endpoint
   * @param filters - Optional filters for the analytics query
   * @returns Promise with monthly trends data
   */
  getMonthlyTrends: async (filters?: Record<string, unknown>): Promise<MonthlyTrendsResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const url = `${API_URL}/analytics/monthly-trends${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await axios.get<MonthlyTrendsResponse>(url);
    
    return response.data;
  },
};
