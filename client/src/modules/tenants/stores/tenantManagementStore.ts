import { create } from 'zustand';
import { Tenant } from '../types/tenant';

interface TenantManagementState {
  isFormOpen: boolean;
  selectedTenant: Tenant | null;
  isConfirmDeleteDialogOpen: boolean;
  tenantToDeleteId: string | null;
  selectedTenantIds: Set<string>;
  isBulkEditOpen: boolean;
  isBulkDeleteDialogOpen: boolean;
  openCreateForm: () => void;
  openEditForm: (tenant: Tenant) => void;
  closeForm: () => void;
  openConfirmDeleteDialog: (id: string) => void;
  closeConfirmDeleteDialog: () => void;
  setTenantToDeleteId: (id: string | null) => void;
  resetDeleteState: () => void;
  toggleTenantSelection: (id: string) => void;
  selectAllTenants: (tenantIds: string[]) => void;
  clearSelection: () => void;
  openBulkEditDialog: () => void;
  closeBulkEditDialog: () => void;
  openBulkDeleteDialog: () => void;
  closeBulkDeleteDialog: () => void;
}

export const useTenantManagementStore = create<TenantManagementState>((set) => ({
  isFormOpen: false,
  selectedTenant: null,
  isConfirmDeleteDialogOpen: false,
  tenantToDeleteId: null,
  selectedTenantIds: new Set<string>(),
  isBulkEditOpen: false,
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
      const newSelection = new Set(state.selectedTenantIds);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return { selectedTenantIds: newSelection };
    }),

  selectAllTenants: (tenantIds: string[]): void =>
    set((state) => {
      const currentSize = state.selectedTenantIds.size;
      const allSelected = currentSize === tenantIds.length && tenantIds.length > 0;
      return { selectedTenantIds: allSelected ? new Set<string>() : new Set(tenantIds) };
    }),

  clearSelection: (): void => set({ selectedTenantIds: new Set<string>() }),

  openBulkEditDialog: (): void => set({ isBulkEditOpen: true }),
  closeBulkEditDialog: (): void => set({ isBulkEditOpen: false, selectedTenantIds: new Set<string>() }),

  openBulkDeleteDialog: (): void => set({ isBulkDeleteDialogOpen: true }),
  closeBulkDeleteDialog: (): void => set({ isBulkDeleteDialogOpen: false, selectedTenantIds: new Set<string>() }),
}));
