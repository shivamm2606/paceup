import { create } from "zustand";

interface UserInfo {
  height?: number;
  currentWeight?: number;
  targetWeight?: number;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  activityLevel?: string;
  goal?: string;
  dailyCalorieGoal?: number;
  isCalorieGoalAutoCalculated?: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  userInfo?: UserInfo;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  setLoading: (value: boolean) => void;
  needsOnboarding: () => boolean;
}

const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),

  clearAuth: () =>
    set({
      user: null,
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
