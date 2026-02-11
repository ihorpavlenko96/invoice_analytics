import { useQuery } from '@tanstack/react-query';
import { invoiceKeys } from './invoiceQueryKeys';
import { invoiceService } from './services/invoiceService';

/**
 * Hook to fetch all invoices
 * @param searchQuery - Optional search term for vendor or customer name (now handled by backend)
 * @param page - Page number (starts at 1)
 * @param limit - Number of items per page
 * @param status - Optional status filter (PAID, UNPAID, OVERDUE)
 * @param includeArchived - Include archived invoices in results (default: false)
 */
export const useInvoices = (
  searchQuery = '',
  page = 1,
  limit = 10,
  status?: string,
  includeArchived = false,
) => {
  return useQuery({
    queryKey: invoiceKeys.list(searchQuery, page, limit, status, includeArchived),
    queryFn: async () => {
      // Pass search query to backend for server-side filtering
      const paginatedResponse = await invoiceService.getInvoices(
        page,
        limit,
        status,
        includeArchived,
        searchQuery || undefined,
      );

      // Return the response as-is since filtering is now done on the backend
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
