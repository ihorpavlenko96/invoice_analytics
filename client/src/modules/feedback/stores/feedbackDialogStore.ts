import { create } from 'zustand';

interface FeedbackDialogState {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

export const useFeedbackDialogStore = create<FeedbackDialogState>((set) => ({
  isOpen: false,
  openDialog: (): void => set({ isOpen: true }),
  closeDialog: (): void => set({ isOpen: false }),
}));
