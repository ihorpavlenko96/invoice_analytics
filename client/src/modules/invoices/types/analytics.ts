export interface MonthlyTrendItem {
  year: number;
  month: number;
  totalAmount: number;
  invoiceCount: number;
}

export interface MonthlyTrendsResponse {
  trends: MonthlyTrendItem[];
}
