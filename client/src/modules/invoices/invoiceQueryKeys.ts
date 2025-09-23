export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (
    vendorSearch?: string,
    customerSearch?: string,
    statusFilter?: string,
    page?: number,
    limit?: number,
  ) => [...invoiceKeys.lists(), { vendorSearch, customerSearch, statusFilter, page, limit }] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};
