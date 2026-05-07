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

// Read tokens from localStorage
function getStoredTokens() {
  try {
    return {
      accessToken: localStorage.getItem("accessToken"),
      refreshToken: localStorage.getItem("refreshToken"),
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

const stored = getStoredTokens();

const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  accessToken: stored.accessToken,
  refreshToken: stored.refreshToken,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken?, refreshToken?) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    set({
      user,
      isAuthenticated: true,
      ...(accessToken && { accessToken }),
      ...(refreshToken && { refreshToken }),
    });
  },

  clearAuth: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (value: boolean) => set({ isLoading: value }),

  needsOnboarding: () => {
    const user = get().user;
    if (!user) return false;
    return !user.userInfo?.gender;
  },
}));

export default useAuthStore;
