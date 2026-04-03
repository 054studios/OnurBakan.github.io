import { create } from 'zustand';
import { ROUTE_COUNTRIES } from '../constants/route';

export type CountryStatus = 'completed' | 'current' | 'upcoming';

interface TripState {
  /** Index into ROUTE_COUNTRIES for the user's current position */
  currentIndex: number;

  /** Derived helpers */
  getStatus: (index: number) => CountryStatus;
  setCurrentIndex: (index: number) => void;
  advance: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  // Default: user is currently in NL (start of route)
  currentIndex: 0,

  getStatus: (index) => {
    const { currentIndex } = get();
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'upcoming';
  },

  setCurrentIndex: (currentIndex) => {
    const clamped = Math.max(0, Math.min(currentIndex, ROUTE_COUNTRIES.length - 1));
    set({ currentIndex: clamped });
  },

  advance: () => {
    const { currentIndex } = get();
    if (currentIndex < ROUTE_COUNTRIES.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },
}));
