import { create } from 'zustand';
import { User } from '../types/user';

const COLUMN_ORDER_STORAGE_KEY = 'userManagement_columnOrder';

interface UserManagementState {
  isFormOpen: boolean;
  selectedUser: User | null;
  isConfirmDeleteDialogOpen: boolean;
  userToDeleteId: string | null;
  isConfirmToggleStatusDialogOpen: boolean;
  userToToggleStatus: User | null;
  columnOrder: string[];
  isSubmitting: boolean;

  openCreateForm: () => void;
  openEditForm: (user: User) => void;
  closeForm: () => void;

  openConfirmDeleteDialog: (id: string) => void;
  closeConfirmDeleteDialog: () => void;
  resetDeleteState: () => void;

  openConfirmToggleStatusDialog: (user: User) => void;
  closeConfirmToggleStatusDialog: () => void;
  resetToggleStatusState: () => void;

  setColumnOrder: (order: string[]) => void;
  loadColumnOrder: () => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

export const useUserManagementStore = create<UserManagementState>((set) => ({
  // Initial state
  isFormOpen: false,
  selectedUser: null,
  isConfirmDeleteDialogOpen: false,
  userToDeleteId: null,
  isConfirmToggleStatusDialogOpen: false,
  userToToggleStatus: null,
  columnOrder: [],
  isSubmitting: false,

  openCreateForm: (): void => set({ isFormOpen: true, selectedUser: null }),
  openEditForm: (user: User): void => set({ isFormOpen: true, selectedUser: user }),
  closeForm: (): void => set({ isFormOpen: false, selectedUser: null, isSubmitting: false }),

  openConfirmDeleteDialog: (id: string): void =>
    set({ isConfirmDeleteDialogOpen: true, userToDeleteId: id }),
  closeConfirmDeleteDialog: (): void =>
    set({ isConfirmDeleteDialogOpen: false, userToDeleteId: null }),
  resetDeleteState: (): void => set({ isConfirmDeleteDialogOpen: false, userToDeleteId: null }),

  openConfirmToggleStatusDialog: (user: User): void =>
    set({ isConfirmToggleStatusDialogOpen: true, userToToggleStatus: user }),
  closeConfirmToggleStatusDialog: (): void =>
    set({ isConfirmToggleStatusDialogOpen: false, userToToggleStatus: null }),
  resetToggleStatusState: (): void =>
    set({ isConfirmToggleStatusDialogOpen: false, userToToggleStatus: null }),

  setColumnOrder: (order: string[]): void => {
    localStorage.setItem(COLUMN_ORDER_STORAGE_KEY, JSON.stringify(order));
    set({ columnOrder: order });
  },

  loadColumnOrder: (): void => {
    const stored = localStorage.getItem(COLUMN_ORDER_STORAGE_KEY);
    if (stored) {
      try {
        const order = JSON.parse(stored);
        if (Array.isArray(order)) {
          set({ columnOrder: order });
        }
      } catch (e) {
        console.error('Failed to load column order from localStorage', e);
      }
    }
  },

  setIsSubmitting: (isSubmitting: boolean): void => set({ isSubmitting }),
}));
