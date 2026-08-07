import { create } from 'zustand';

export type FeedbackRating = 'Terrible' | 'Poor' | 'Okay' | 'Good' | 'Excellent';

export type FeedbackCategory =
  | 'Bug / unexpected behavior'
  | 'Feature request'
  | 'General feedback'
  | 'Performance issue'
  | 'UI / UX feedback'
  | 'Other';

interface FeedbackDialogState {
  isOpen: boolean;
  rating: FeedbackRating | null;
  category: FeedbackCategory | '';
  message: string;
  canContact: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  setRating: (rating: FeedbackRating) => void;
  setCategory: (category: FeedbackCategory | '') => void;
  setMessage: (message: string) => void;
  toggleCanContact: () => void;
  resetForm: () => void;
}

const initialState = {
  isOpen: false,
  rating: null,
  category: '' as const,
  message: '',
  canContact: false,
};

export const useFeedbackDialogStore = create<FeedbackDialogState>((set) => ({
  ...initialState,

  openDialog: (): void => set({ isOpen: true }),

  closeDialog: (): void =>
    set({
      isOpen: false,
      rating: null,
      category: '',
      message: '',
      canContact: false,
    }),

  setRating: (rating: FeedbackRating): void => set({ rating }),

  setCategory: (category: FeedbackCategory | ''): void => set({ category }),

  setMessage: (message: string): void => set({ message }),

  toggleCanContact: (): void => set((state) => ({ canContact: !state.canContact })),

  resetForm: (): void =>
    set({
      rating: null,
      category: '',
      message: '',
      canContact: false,
    }),
}));
