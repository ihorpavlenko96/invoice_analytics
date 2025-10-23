import { Invoice } from '../../invoices/types/invoice';
import { VendorData, MonthlyData, VendorDetails } from '../types/dashboard';
import { subDays, isAfter, format, parseISO } from 'date-fns';

/**
 * Filter invoices from the last N days based on issueDate
 */
export const filterInvoicesByDays = (invoices: Invoice[], days: number): Invoice[] => {
  const cutoffDate = subDays(new Date(), days);

  return invoices.filter((invoice) => {
    try {
      const issueDate = parseISO(invoice.issueDate);
      return isAfter(issueDate, cutoffDate) || issueDate.getTime() === cutoffDate.getTime();
    } catch {
      return false;
    }
  });
};

/**
 * Aggregate invoices by vendor and sum total amounts
 */
export const aggregateByVendor = (invoices: Invoice[]): VendorData[] => {
  const vendorMap = new Map<string, number>();

  invoices.forEach((invoice) => {
    const currentTotal = vendorMap.get(invoice.vendorName) || 0;
    vendorMap.set(invoice.vendorName, currentTotal + invoice.totalAmount);
  });

  const vendorData: VendorData[] = Array.from(vendorMap.entries()).map(([vendorName, totalAmount]) => ({
    vendorName,
    totalAmount,
  }));

  // Sort by total amount descending
  vendorData.sort((a, b) => b.totalAmount - a.totalAmount);

  return vendorData;
};

/**
 * Get monthly breakdown for a specific vendor
 */
export const getVendorMonthlyBreakdown = (
  invoices: Invoice[],
  vendorName: string,
): VendorDetails => {
  const vendorInvoices = invoices.filter((invoice) => invoice.vendorName === vendorName);

  const monthlyMap = new Map<string, { total: number; dates: string[] }>();

  vendorInvoices.forEach((invoice) => {
    try {
      const issueDate = parseISO(invoice.issueDate);
      const monthLabel = format(issueDate, 'MMMM yyyy');

      const current = monthlyMap.get(monthLabel) || { total: 0, dates: [] };
      current.total += invoice.totalAmount;
      current.dates.push(invoice.issueDate);

      monthlyMap.set(monthLabel, current);
    } catch {
      // Skip invalid dates
    }
  });

  const monthlyBreakdown: MonthlyData[] = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      totalAmount: data.total,
      invoiceDates: data.dates.sort(),
    }))
    .sort((a, b) => {
      // Sort by month descending (most recent first)
      return b.month.localeCompare(a.month);
    });

  return {
    vendorName,
    monthlyBreakdown,
  };
};
