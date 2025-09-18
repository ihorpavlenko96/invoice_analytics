export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (searchTerm?: string, page?: number, limit?: number, filters?: object) =>
    [...invoiceKeys.lists(), { searchTerm, page, limit, filters }] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};
