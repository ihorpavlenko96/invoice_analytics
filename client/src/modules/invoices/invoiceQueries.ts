import { useQuery } from '@tanstack/react-query';
import { invoiceKeys } from './invoiceQueryKeys';
import { invoiceService } from './services/invoiceService';

/**
 * Hook to fetch all invoices
 * @param searchTerm - Optional search term to filter invoices
 * @param page - Page number (starts at 1)
 * @param limit - Number of items per page
 * @param filterStatus - Optional status filter (Active/Overdue)
 * @param filterCustomer - Optional customer filter
 * @param filterVendor - Optional vendor filter
 */
export const useInvoices = (
  searchTerm = '',
  page = 1,
  limit = 10,
  filterStatus = '',
  filterCustomer = '',
  filterVendor = ''
) => {
  return useQuery({
    queryKey: invoiceKeys.list(searchTerm, page, limit, filterStatus, filterCustomer, filterVendor),
    queryFn: async () => {
      const paginatedResponse = await invoiceService.getInvoices(page, limit);

      // Apply filtering
      let filteredItems = paginatedResponse.items;

      // Search term filter
      if (searchTerm) {
        const lowerCaseSearch = searchTerm.toLowerCase();
        filteredItems = filteredItems.filter(
          (invoice) =>
            invoice.invoiceNumber.toLowerCase().includes(lowerCaseSearch) ||
            invoice.vendorName.toLowerCase().includes(lowerCaseSearch) ||
            invoice.customerName.toLowerCase().includes(lowerCaseSearch),
        );
      }

      // Status filter
      if (filterStatus) {
        filteredItems = filteredItems.filter((invoice) => {
          const isOverdue = new Date(invoice.dueDate) < new Date();
          const status = isOverdue ? 'Overdue' : 'Active';
          return status === filterStatus;
        });
      }

      // Customer filter
      if (filterCustomer) {
        filteredItems = filteredItems.filter(
          (invoice) => invoice.customerName === filterCustomer,
        );
      }

      // Vendor filter
      if (filterVendor) {
        filteredItems = filteredItems.filter(
          (invoice) => invoice.vendorName === filterVendor,
        );
      }

      // Return filtered items with updated counts if any filters are applied
      if (searchTerm || filterStatus || filterCustomer || filterVendor) {
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
