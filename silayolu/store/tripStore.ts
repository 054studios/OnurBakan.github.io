import { create } from 'zustand';
import { ROUTE_COUNTRIES } from '../constants/route';

export type CountryStatus = 'completed' | 'current' | 'upcoming';

interface TripState {
  /** Index into ROUTE_COUNTRIES for the user's current position */
  currentIndex: number;
  /** Cumulative km driven today (used for distance challenges) */
  distanceKm: number;

  getStatus: (index: number) => CountryStatus;
  setCurrentIndex: (index: number) => void;
  advance: () => void;
  setDistanceKm: (km: number) => void;
  addDistanceKm: (km: number) => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  currentIndex: 0,
  distanceKm: 0,

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

  setDistanceKm: (distanceKm) => set({ distanceKm: Math.max(0, distanceKm) }),
  addDistanceKm: (km)         => set((s) => ({ distanceKm: s.distanceKm + km })),
}));
