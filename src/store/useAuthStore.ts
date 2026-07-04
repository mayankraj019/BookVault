import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isOnline: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setOnline: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  clearAuth: () => set({ user: null, accessToken: null }),
  setOnline: (status) => set({ isOnline: status }),
}));
