import { create } from 'zustand';
import { Tenant } from '../types/tenant';

interface TenantManagementState {
  isFormOpen: boolean;
  selectedTenant: Tenant | null;
  isConfirmDeleteDialogOpen: boolean;
  tenantToDeleteId: string | null;
  selectedTenantIds: Set<string>;
  isBulkDeleteDialogOpen: boolean;
  openCreateForm: () => void;
  openEditForm: (tenant: Tenant) => void;
  closeForm: () => void;
  openConfirmDeleteDialog: (id: string) => void;
  closeConfirmDeleteDialog: () => void;
  setTenantToDeleteId: (id: string | null) => void;
  resetDeleteState: () => void;
  toggleTenantSelection: (id: string) => void;
  selectAllTenants: (tenants: Tenant[]) => void;
  clearSelection: () => void;
  openBulkDeleteDialog: () => void;
  closeBulkDeleteDialog: () => void;
}

export const useTenantManagementStore = create<TenantManagementState>((set) => ({
  isFormOpen: false,
  selectedTenant: null,
  isConfirmDeleteDialogOpen: false,
  tenantToDeleteId: null,
  selectedTenantIds: new Set<string>(),
  isBulkDeleteDialogOpen: false,

  openCreateForm: (): void => set({ isFormOpen: true, selectedTenant: null }),
  openEditForm: (tenant: Tenant): void => set({ isFormOpen: true, selectedTenant: tenant }),
  closeForm: (): void => set({ isFormOpen: false, selectedTenant: null }),

  openConfirmDeleteDialog: (id: string): void =>
    set({ isConfirmDeleteDialogOpen: true, tenantToDeleteId: id }),
  closeConfirmDeleteDialog: (): void =>
    set({ isConfirmDeleteDialogOpen: false, tenantToDeleteId: null }),
  setTenantToDeleteId: (id: string | null): void => set({ tenantToDeleteId: id }),
  resetDeleteState: (): void => set({ isConfirmDeleteDialogOpen: false, tenantToDeleteId: null }),

  toggleTenantSelection: (id: string): void =>
    set((state) => {
      const newSelectedIds = new Set(state.selectedTenantIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      return { selectedTenantIds: newSelectedIds };
    }),

  selectAllTenants: (tenants: Tenant[]): void =>
    set((state) => {
      const allTenantIds = new Set(tenants.map((t) => t.id));
      const hasAllSelected = tenants.every((t) => state.selectedTenantIds.has(t.id));
      return {
        selectedTenantIds: hasAllSelected ? new Set<string>() : allTenantIds,
      };
    }),

  clearSelection: (): void => set({ selectedTenantIds: new Set<string>() }),

  openBulkDeleteDialog: (): void => set({ isBulkDeleteDialogOpen: true }),
  closeBulkDeleteDialog: (): void => set({ isBulkDeleteDialogOpen: false, selectedTenantIds: new Set<string>() }),
}));
