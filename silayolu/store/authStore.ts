import { create } from 'zustand';
import auth from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import type { SupportedLanguage } from '../constants/i18n';

type AuthError =
  | 'invalidEmail'
  | 'wrongPassword'
  | 'userNotFound'
  | 'emailInUse'
  | 'weakPassword'
  | 'networkError'
  | 'unknownError';

function mapFirebaseError(code: string): AuthError {
  switch (code) {
    case 'auth/invalid-email':
      return 'invalidEmail';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'wrongPassword';
    case 'auth/user-not-found':
      return 'userNotFound';
    case 'auth/email-already-in-use':
      return 'emailInUse';
    case 'auth/weak-password':
      return 'weakPassword';
    case 'auth/network-request-failed':
      return 'networkError';
    default:
      return 'unknownError';
  }
}

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  isGuest: boolean;
  isLoading: boolean;
  language: SupportedLanguage;
  error: AuthError | null;

  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  clearError: () => void;

  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isGuest: false,
  isLoading: false,
  language: 'tr',
  error: null,

  setUser: (user) => set({ user }),
  setLanguage: (language) => set({ language }),
  clearError: () => set({ error: null }),

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await auth().signInWithEmailAndPassword(email, password);
      set({ isLoading: false });
      return true;
    } catch (e: any) {
      set({ isLoading: false, error: mapFirebaseError(e?.code ?? '') });
      return false;
    }
  },

  signUp: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const cred = await auth().createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });
      set({ isLoading: false });
      return true;
    } catch (e: any) {
      set({ isLoading: false, error: mapFirebaseError(e?.code ?? '') });
      return false;
    }
  },

  continueAsGuest: () => set({ isGuest: true, user: null }),

  signOut: async () => {
    set({ isLoading: true });
    try {
      await auth().signOut();
    } finally {
      set({ user: null, isGuest: false, isLoading: false });
    }
  },
}));
