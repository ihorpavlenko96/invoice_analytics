import { useQuery } from '@tanstack/react-query';
import { invoiceKeys } from './invoiceQueryKeys';
import { invoiceService } from './services/invoiceService';
import { startOfDay, subDays, subWeeks, subMonths, isAfter, isSameDay } from 'date-fns';

/**
 * Hook to fetch all invoices
 * @param filterStatus - Filter by status (all, active, overdue)
 * @param filterVendor - Filter by vendor name
 * @param filterCustomer - Filter by customer name
 * @param filterDate - Filter by date range (all, today, yesterday, last_week, last_month)
 * @param page - Page number (starts at 1)
 * @param limit - Number of items per page
 */
export const useInvoices = (filterStatus = 'all', filterVendor = '', filterCustomer = '', filterDate = 'all', page = 1, limit = 10) => {
  return useQuery({
    queryKey: invoiceKeys.list(filterStatus, filterVendor, filterCustomer, filterDate, page, limit),
    queryFn: async () => {
      const paginatedResponse = await invoiceService.getInvoices(page, limit);

      // Apply client-side filtering
      const hasFilters = filterStatus !== 'all' || filterVendor || filterCustomer || filterDate !== 'all';

      if (hasFilters) {
        const filteredItems = paginatedResponse.items.filter((invoice) => {
          // Status filter
          if (filterStatus !== 'all') {
            const isOverdue = new Date(invoice.dueDate) < new Date();
            const isActive = !isOverdue;

            if (filterStatus === 'active' && !isActive) return false;
            if (filterStatus === 'overdue' && !isOverdue) return false;
          }

          // Date filter (based on issue date)
          if (filterDate !== 'all') {
            const invoiceDate = new Date(invoice.issueDate);
            const today = startOfDay(new Date());
            let dateThreshold: Date;

            switch (filterDate) {
              case 'today':
                if (!isSameDay(invoiceDate, today)) return false;
                break;
              case 'yesterday':
                const yesterday = subDays(today, 1);
                if (!isSameDay(invoiceDate, yesterday)) return false;
                break;
              case 'last_week':
                dateThreshold = subWeeks(today, 1);
                if (!isAfter(invoiceDate, dateThreshold) || isAfter(invoiceDate, today)) return false;
                break;
              case 'last_month':
                dateThreshold = subMonths(today, 1);
                if (!isAfter(invoiceDate, dateThreshold) || isAfter(invoiceDate, today)) return false;
                break;
            }
          }

          // Vendor filter
          if (filterVendor && !invoice.vendorName.toLowerCase().includes(filterVendor.toLowerCase())) {
            return false;
          }

          // Customer filter
          if (filterCustomer && !invoice.customerName.toLowerCase().includes(filterCustomer.toLowerCase())) {
            return false;
          }

          return true;
        });

        // Return filtered items with updated counts
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
