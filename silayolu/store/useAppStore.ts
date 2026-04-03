import { create } from 'zustand';

// General app-level UI state. Auth state lives in authStore.ts.
interface AppState {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  hasSeenOnboarding: false,
  setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),
}));
