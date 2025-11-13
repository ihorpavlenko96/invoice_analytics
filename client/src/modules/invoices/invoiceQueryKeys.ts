export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (searchQuery?: string, page?: number, limit?: number) =>
    [...invoiceKeys.lists(), { searchQuery, page, limit }] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  analytics: () => [...invoiceKeys.all, 'analytics'] as const,
  statusDistribution: () => [...invoiceKeys.analytics(), 'status-distribution'] as const,
};
