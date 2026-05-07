import { create } from "zustand";
import type { User } from "../types/user.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken?: string, refreshToken?: string) => void;
  clearAuth: () => void;
  setLoading: (value: boolean) => void;
  needsOnboarding: () => boolean;
}

const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken?, refreshToken?) =>
    set({
      user,
      isAuthenticated: true,
      ...(accessToken && { accessToken }),
      ...(refreshToken && { refreshToken }),
    }),

  clearAuth: () =>
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (value: boolean) => set({ isLoading: value }),

  needsOnboarding: () => {
    const user = get().user;
    if (!user) return false;
    return !user.userInfo?.gender;
  },
}));

export default useAuthStore;
