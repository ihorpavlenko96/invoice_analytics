import { useQuery } from '@tanstack/react-query';
import { invoiceKeys } from './invoiceQueryKeys';
import { invoiceService } from './services/invoiceService';

/**
 * Hook to fetch all invoices
 * @param vendorSearch - Optional vendor name search term
 * @param customerSearch - Optional customer name search term
 * @param statusFilter - Optional status filter
 * @param page - Page number (starts at 1)
 * @param limit - Number of items per page
 */
export const useInvoices = (
  vendorSearch = '',
  customerSearch = '',
  statusFilter = '',
  page = 1,
  limit = 10,
) => {
  return useQuery({
    queryKey: invoiceKeys.list(vendorSearch, customerSearch, statusFilter, page, limit),
    queryFn: async () => {
      const paginatedResponse = await invoiceService.getInvoices(page, limit);

      // Apply filters if any are specified
      let filteredItems = paginatedResponse.items;

      if (vendorSearch) {
        const lowerCaseVendorSearch = vendorSearch.toLowerCase();
        filteredItems = filteredItems.filter((invoice) =>
          invoice.vendorName.toLowerCase().includes(lowerCaseVendorSearch),
        );
      }

      if (customerSearch) {
        const lowerCaseCustomerSearch = customerSearch.toLowerCase();
        filteredItems = filteredItems.filter((invoice) =>
          invoice.customerName.toLowerCase().includes(lowerCaseCustomerSearch),
        );
      }

      if (statusFilter) {
        filteredItems = filteredItems.filter((invoice) => invoice.status === statusFilter);
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
