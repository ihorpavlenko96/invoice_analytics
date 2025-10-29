import { useQuery } from '@tanstack/react-query';
import { invoiceKeys } from './invoiceQueryKeys';
import { invoiceService } from './services/invoiceService';

/**
 * Hook to fetch all invoices
 * @param searchQuery - Optional search term for vendor or customer name
 * @param page - Page number (starts at 1)
 * @param limit - Number of items per page
 * @param fromDate - Optional start date (YYYY-MM-DD) for issueDate filter
 * @param toDate - Optional end date (YYYY-MM-DD) for issueDate filter
 */
export const useInvoices = (
  searchQuery = '',
  page = 1,
  limit = 10,
  fromDate?: string,
  toDate?: string,
) => {
  return useQuery({
    queryKey: invoiceKeys.list(searchQuery, page, limit, fromDate, toDate),
    queryFn: async () => {
      const paginatedResponse = await invoiceService.getInvoices(
        page,
        limit,
        searchQuery,
        fromDate,
        toDate,
      );

      // Apply client-side filters as a fallback (keeps previous behavior)
      let filteredItems = paginatedResponse.items;

      if (searchQuery) {
        const lowerCaseSearchQuery = searchQuery.toLowerCase();
        filteredItems = filteredItems.filter(
          (invoice) =>
            invoice.vendorName.toLowerCase().includes(lowerCaseSearchQuery) ||
            invoice.customerName.toLowerCase().includes(lowerCaseSearchQuery),
        );
      }

      if (fromDate || toDate) {
        filteredItems = filteredItems.filter((invoice) => {
          const issue = invoice.issueDate; // YYYY-MM-DD
          if (fromDate && issue < fromDate) return false;
          if (toDate && issue > toDate) return false;
          return true;
        });
      }

      // Return filtered items with updated counts
      return {
        ...paginatedResponse,
        items: filteredItems,
        total: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / limit),
      };
    },
  });
};

/**
 * Hook to fetch a single invoice by ID
 */
export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoiceService.getInvoice(id),
    enabled: !!id, // Only run if ID is provided
  });
};
