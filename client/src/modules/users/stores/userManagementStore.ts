import { create } from 'zustand';
import { User } from '../types/user';
import { RoleValue } from '../../../common/constants/roles';

interface UserFilters {
  email: string;
  name: string;
  tenant: string;
  role: RoleValue | '';
  status: 'all' | 'active' | 'inactive';
  dateFrom: string;
  dateTo: string;
}

interface UserManagementState {
  isFormOpen: boolean;
  selectedUser: User | null;
  isConfirmDeleteDialogOpen: boolean;
  userToDeleteId: string | null;
  isConfirmToggleStatusDialogOpen: boolean;
  userToToggleStatus: User | null;

  filters: UserFilters;
  setFilter: <K extends keyof UserFilters>(key: K, value: UserFilters[K]) => void;
  clearFilters: () => void;

  openCreateForm: () => void;
  openEditForm: (user: User) => void;
  closeForm: () => void;

  openConfirmDeleteDialog: (id: string) => void;
  closeConfirmDeleteDialog: () => void;
  resetDeleteState: () => void;

  openConfirmToggleStatusDialog: (user: User) => void;
  closeConfirmToggleStatusDialog: () => void;
  resetToggleStatusState: () => void;
}

const initialFilters: UserFilters = {
  email: '',
  name: '',
  tenant: '',
  role: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
};

export const useUserManagementStore = create<UserManagementState>((set) => ({
  // Initial state
  isFormOpen: false,
  selectedUser: null,
  isConfirmDeleteDialogOpen: false,
  userToDeleteId: null,
  isConfirmToggleStatusDialogOpen: false,
  userToToggleStatus: null,

  filters: initialFilters,
  setFilter: <K extends keyof UserFilters>(key: K, value: UserFilters[K]): void =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  clearFilters: (): void => set({ filters: initialFilters }),

  openCreateForm: (): void => set({ isFormOpen: true, selectedUser: null }),
  openEditForm: (user: User): void => set({ isFormOpen: true, selectedUser: user }),
  closeForm: (): void => set({ isFormOpen: false, selectedUser: null }),

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
}));
