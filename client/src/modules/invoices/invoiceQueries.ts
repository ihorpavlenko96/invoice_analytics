import { useQuery } from '@tanstack/react-query';
import { invoiceKeys } from './invoiceQueryKeys';
import { invoiceService } from './services/invoiceService';

interface InvoiceFilters {
  status?: string;
  vendor?: string;
  customer?: string;
  amountRange?: string;
  issueDateFrom?: string;
  issueDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

/**
 * Hook to fetch all invoices
 * @param searchTerm - Optional search term to filter invoices
 * @param page - Page number (starts at 1)
 * @param limit - Number of items per page
 * @param filters - Additional filter options
 */
export const useInvoices = (searchTerm = '', page = 1, limit = 10, filters: InvoiceFilters = {}) => {
  return useQuery({
    queryKey: invoiceKeys.list(searchTerm, page, limit, filters),
    queryFn: async () => {
      const paginatedResponse = await invoiceService.getInvoices(page, limit);

      // Apply all filters
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

      // Status filter (based on due date)
      if (filters.status && filters.status !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        filteredItems = filteredItems.filter((invoice) => {
          const dueDate = new Date(invoice.dueDate);
          const isOverdue = dueDate < today;

          if (filters.status === 'active') {
            return !isOverdue;
          } else if (filters.status === 'overdue') {
            return isOverdue;
          }
          return true;
        });
      }

      // Vendor filter
      if (filters.vendor) {
        const lowerCaseVendor = filters.vendor.toLowerCase();
        filteredItems = filteredItems.filter((invoice) =>
          invoice.vendorName.toLowerCase().includes(lowerCaseVendor)
        );
      }

      // Customer filter
      if (filters.customer) {
        const lowerCaseCustomer = filters.customer.toLowerCase();
        filteredItems = filteredItems.filter((invoice) =>
          invoice.customerName.toLowerCase().includes(lowerCaseCustomer)
        );
      }

      // Amount range filter
      if (filters.amountRange && filters.amountRange !== 'all') {
        filteredItems = filteredItems.filter((invoice) => {
          const amount = invoice.totalAmount;
          switch (filters.amountRange) {
            case '0-100':
              return amount >= 0 && amount <= 100;
            case '100-1000':
              return amount > 100 && amount <= 1000;
            case '1000-10000':
              return amount > 1000 && amount <= 10000;
            case '10000+':
              return amount > 10000;
            default:
              return true;
          }
        });
      }

      // Issue date range filter
      if (filters.issueDateFrom || filters.issueDateTo) {
        filteredItems = filteredItems.filter((invoice) => {
          const issueDate = new Date(invoice.issueDate);

          if (filters.issueDateFrom && issueDate < new Date(filters.issueDateFrom)) {
            return false;
          }

          if (filters.issueDateTo && issueDate > new Date(filters.issueDateTo)) {
            return false;
          }

          return true;
        });
      }

      // Due date range filter
      if (filters.dueDateFrom || filters.dueDateTo) {
        filteredItems = filteredItems.filter((invoice) => {
          const dueDate = new Date(invoice.dueDate);

          if (filters.dueDateFrom && dueDate < new Date(filters.dueDateFrom)) {
            return false;
          }

          if (filters.dueDateTo && dueDate > new Date(filters.dueDateTo)) {
            return false;
          }

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
