import { Tenant } from './types/tenant';
import axios from 'axios';

export type CreateTenantInput = {
  name: string;
  alias: string;
};

export type UpdateTenantInput = {
  name?: string;
  alias?: string;
};

export type UpdateTenantPayload = {
  id: string;
  data: UpdateTenantInput;
};

export type BulkUpdateItem = {
  id: string;
  name?: string;
  alias?: string;
};

export type BulkUpdateTenantInput = {
  updates: BulkUpdateItem[];
};

export type BulkUpdateResult = {
  successful: Tenant[];
  failed: { id: string; error: string }[];
  total: number;
  successCount: number;
  failureCount: number;
};

export type BulkDeleteTenantInput = {
  ids: string[];
};

export type BulkDeleteResult = {
  successful: string[];
  failed: { id: string; error: string }[];
  total: number;
  successCount: number;
  failureCount: number;
};

export const createTenant = (tenantData: CreateTenantInput) =>
  axios.post<Tenant>('/tenants', tenantData);

export const updateTenant = (tenantPayload: UpdateTenantPayload) =>
  axios.patch<Tenant>(`/tenants/${tenantPayload.id}`, tenantPayload.data);

export const deleteTenant = (tenantId: string) => axios.delete(`/tenants/${tenantId}`);

export const bulkUpdateTenants = (bulkUpdateData: BulkUpdateTenantInput) =>
  axios.patch<BulkUpdateResult>('/tenants/bulk', bulkUpdateData);

export const bulkDeleteTenants = (bulkDeleteData: BulkDeleteTenantInput) =>
  axios.delete<BulkDeleteResult>('/tenants/bulk', { data: bulkDeleteData });
