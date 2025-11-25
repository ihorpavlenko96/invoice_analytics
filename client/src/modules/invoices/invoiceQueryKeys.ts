export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (searchQuery?: string, page?: number, limit?: number, status?: string) =>
    [...invoiceKeys.lists(), { searchQuery, page, limit, status }] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  analytics: () => [...invoiceKeys.all, 'analytics'] as const,
  monthlyTrends: (filters?: Record<string, unknown>) => 
    [...invoiceKeys.analytics(), 'monthlyTrends', filters] as const,
};
