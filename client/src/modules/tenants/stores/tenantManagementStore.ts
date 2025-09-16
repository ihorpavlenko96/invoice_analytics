import { create } from 'zustand';
import { Tenant } from '../types/tenant';

interface TenantManagementState {
  isFormOpen: boolean;
  selectedTenant: Tenant | null;
  isConfirmDeleteDialogOpen: boolean;
  tenantToDeleteId: string | null;
  selectedTenantIds: Set<string>;
  isConfirmBulkDeleteDialogOpen: boolean;
  openCreateForm: () => void;
  openEditForm: (tenant: Tenant) => void;
  closeForm: () => void;
  openConfirmDeleteDialog: (id: string) => void;
  closeConfirmDeleteDialog: () => void;
  setTenantToDeleteId: (id: string | null) => void;
  resetDeleteState: () => void;
  toggleTenantSelection: (id: string) => void;
  selectAllTenants: (ids: string[]) => void;
  clearSelection: () => void;
  openConfirmBulkDeleteDialog: () => void;
  closeConfirmBulkDeleteDialog: () => void;
}

export const useTenantManagementStore = create<TenantManagementState>((set) => ({
  isFormOpen: false,
  selectedTenant: null,
  isConfirmDeleteDialogOpen: false,
  tenantToDeleteId: null,
  selectedTenantIds: new Set<string>(),
  isConfirmBulkDeleteDialogOpen: false,

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
      const newSet = new Set(state.selectedTenantIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { selectedTenantIds: newSet };
    }),

  selectAllTenants: (ids: string[]): void =>
    set((state) => {
      const currentSelected = state.selectedTenantIds;
      const allSelected = ids.every(id => currentSelected.has(id));
      if (allSelected) {
        return { selectedTenantIds: new Set<string>() };
      } else {
        return { selectedTenantIds: new Set(ids) };
      }
    }),

  clearSelection: (): void => set({ selectedTenantIds: new Set<string>() }),

  openConfirmBulkDeleteDialog: (): void => set({ isConfirmBulkDeleteDialogOpen: true }),
  closeConfirmBulkDeleteDialog: (): void =>
    set({ isConfirmBulkDeleteDialogOpen: false, selectedTenantIds: new Set<string>() }),
}));
