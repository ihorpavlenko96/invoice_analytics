import { create } from 'zustand';
import { Role } from '../types/role';

interface RoleManagementState {
  isFormOpen: boolean;
  selectedRole: Role | null;
  isConfirmDeleteDialogOpen: boolean;
  roleToDelete: Role | null;

  openCreateForm: () => void;
  openEditForm: (role: Role) => void;
  closeForm: () => void;
  openConfirmDeleteDialog: (role: Role) => void;
  closeConfirmDeleteDialog: () => void;
}

export const useRoleManagementStore = create<RoleManagementState>((set) => ({
  isFormOpen: false,
  selectedRole: null,
  isConfirmDeleteDialogOpen: false,
  roleToDelete: null,

  openCreateForm: (): void => set({ isFormOpen: true, selectedRole: null }),
  openEditForm: (role: Role): void => set({ isFormOpen: true, selectedRole: role }),
  closeForm: (): void => set({ isFormOpen: false, selectedRole: null }),
  openConfirmDeleteDialog: (role: Role): void =>
    set({ isConfirmDeleteDialogOpen: true, roleToDelete: role }),
  closeConfirmDeleteDialog: (): void =>
    set({ isConfirmDeleteDialogOpen: false, roleToDelete: null }),
}));
