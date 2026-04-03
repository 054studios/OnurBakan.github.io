import { create } from 'zustand';

type Language = 'tr' | 'en';

interface AppState {
  language: Language;
  isAuthenticated: boolean;
  userId: string | null;
  setLanguage: (lang: Language) => void;
  setAuthenticated: (isAuth: boolean, userId?: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'tr',
  isAuthenticated: false,
  userId: null,
  setLanguage: (language) => set({ language }),
  setAuthenticated: (isAuthenticated, userId = null) =>
    set({ isAuthenticated, userId }),
}));
