export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (searchQuery?: string, page?: number, limit?: number, fromDate?: string, toDate?: string) =>
    [...invoiceKeys.lists(), { searchQuery, page, limit, fromDate, toDate }] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};
