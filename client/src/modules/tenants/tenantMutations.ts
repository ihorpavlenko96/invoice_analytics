import { Tenant } from './types/tenant';
import axios from 'axios';

export type CreateTenantInput = {
  name: string;
  alias: string;
};

export type UpdateTenantInput = {
  name: string;
};

export type UpdateTenantPayload = {
  id: string;
  data: UpdateTenantInput;
};

export type BulkDeleteResult = {
  successful: string[];
  failed: Array<{ id: string; error: string }>;
  totalRequested: number;
  totalDeleted: number;
  totalFailed: number;
};

export const createTenant = (tenantData: CreateTenantInput) =>
  axios.post<Tenant>('/tenants', tenantData);

export const updateTenant = (tenantPayload: UpdateTenantPayload) =>
  axios.patch<Tenant>(`/tenants/${tenantPayload.id}`, tenantPayload.data);

export const deleteTenant = (tenantId: string) => axios.delete(`/tenants/${tenantId}`);

export const bulkDeleteTenants = (ids: string[]) =>
  axios.post<BulkDeleteResult>('/tenants/bulk-delete', { ids });
