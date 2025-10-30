export interface VendorData {
  vendorName: string;
  totalAmount: number;
}

export interface CustomerData {
  customerName: string;
  totalAmount: number;
}

export interface MonthlyData {
  month: string;
  totalAmount: number;
  invoiceDates: string[];
}

export interface VendorDetails {
  vendorName: string;
  monthlyBreakdown: MonthlyData[];
}

export interface CustomerDetails {
  customerName: string;
  monthlyBreakdown: MonthlyData[];
}
