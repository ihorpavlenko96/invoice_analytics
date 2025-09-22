export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (
    filters: string,
    page?: number,
    limit?: number,
    filterStatus?: string,
    filterCustomer?: string,
    filterVendor?: string
  ) =>
    [...invoiceKeys.lists(), { filters, page, limit, filterStatus, filterCustomer, filterVendor }] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};
