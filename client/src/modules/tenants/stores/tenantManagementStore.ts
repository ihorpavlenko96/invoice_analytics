import { create } from 'zustand';
import { Tenant } from '../types/tenant';

interface TenantManagementState {
  isFormOpen: boolean;
  selectedTenant: Tenant | null;
  isConfirmDeleteDialogOpen: boolean;
  tenantToDeleteId: string | null;
  selectedTenantIds: string[];
  isBulkDeleteDialogOpen: boolean;
  openCreateForm: () => void;
  openEditForm: (tenant: Tenant) => void;
  closeForm: () => void;
  openConfirmDeleteDialog: (id: string) => void;
  closeConfirmDeleteDialog: () => void;
  setTenantToDeleteId: (id: string | null) => void;
  resetDeleteState: () => void;
  setSelectedTenantIds: (ids: string[]) => void;
  toggleTenantSelection: (id: string) => void;
  clearSelectedTenants: () => void;
  openBulkDeleteDialog: () => void;
  closeBulkDeleteDialog: () => void;
}

export const useTenantManagementStore = create<TenantManagementState>((set, get) => ({
  isFormOpen: false,
  selectedTenant: null,
  isConfirmDeleteDialogOpen: false,
  tenantToDeleteId: null,
  selectedTenantIds: [],
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

  setSelectedTenantIds: (ids: string[]): void => set({ selectedTenantIds: ids }),
  toggleTenantSelection: (id: string): void => {
    const currentIds = get().selectedTenantIds;
    const newIds = currentIds.includes(id)
      ? currentIds.filter((selectedId) => selectedId !== id)
      : [...currentIds, id];
    set({ selectedTenantIds: newIds });
  },
  clearSelectedTenants: (): void => set({ selectedTenantIds: [] }),
  openBulkDeleteDialog: (): void => set({ isBulkDeleteDialogOpen: true }),
  closeBulkDeleteDialog: (): void => set({ isBulkDeleteDialogOpen: false, selectedTenantIds: [] }),
}));
