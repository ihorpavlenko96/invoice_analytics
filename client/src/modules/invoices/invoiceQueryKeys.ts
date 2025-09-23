export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (filterStatus: string, filterVendor: string, filterCustomer: string, filterDate: string, page?: number, limit?: number) =>
    [...invoiceKeys.lists(), { filterStatus, filterVendor, filterCustomer, filterDate, page, limit }] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};
