export const invoiceKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (
    filters: string,
    page?: number,
    limit?: number,
    filterStatus?: string,
    filterCustomer?: string,
    filterVendor?: string,
    filterIssueDateFrom?: Date | null,
    filterIssueDateTo?: Date | null,
    filterDueDateFrom?: Date | null,
    filterDueDateTo?: Date | null
  ) =>
    [...invoiceKeys.lists(), {
      filters,
      page,
      limit,
      filterStatus,
      filterCustomer,
      filterVendor,
      filterIssueDateFrom,
      filterIssueDateTo,
      filterDueDateFrom,
      filterDueDateTo
    }] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};
