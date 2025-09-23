import { useQuery } from '@tanstack/react-query';
import { invoiceKeys } from './invoiceQueryKeys';
import { invoiceService } from './services/invoiceService';

/**
 * Hook to fetch all invoices
 * @param searchTerm - Optional search term to filter invoices (deprecated, kept for compatibility)
 * @param page - Page number (starts at 1)
 * @param limit - Number of items per page
 * @param statusFilter - Optional status filter (Active/Overdue)
 * @param dateFilter - Optional date filter for issue date (YYYY-MM-DD format)
 */
export const useInvoices = (searchTerm = '', page = 1, limit = 10, statusFilter = '', dateFilter = '') => {
  return useQuery({
    queryKey: invoiceKeys.list(searchTerm, page, limit, statusFilter, dateFilter),
    queryFn: async () => {
      const paginatedResponse = await invoiceService.getInvoices(page, limit);
      let filteredItems = paginatedResponse.items;

      // Apply date filter (filter by issue date)
      if (dateFilter) {
        filteredItems = filteredItems.filter((invoice) => {
          const invoiceDate = new Date(invoice.issueDate);
          const filterDate = new Date(dateFilter);
          return invoiceDate.toDateString() === filterDate.toDateString();
        });
      }

      // Apply status filter
      if (statusFilter) {
        filteredItems = filteredItems.filter((invoice) => {
          const isOverdue = new Date(invoice.dueDate) < new Date();
          const status = isOverdue ? 'Overdue' : 'Active';
          return status === statusFilter;
        });
      }

      // Return filtered items with updated counts if any filters are applied
      if (dateFilter || statusFilter) {
        return {
          ...paginatedResponse,
          items: filteredItems,
          total: filteredItems.length,
          totalPages: Math.ceil(filteredItems.length / limit),
        };
      }

      return paginatedResponse;
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
