import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Role } from "@/lib/types";
import { removeToken, setToken } from "@/lib/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  role: () => Role | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token, user) => {
        setToken(token);
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        removeToken();
        set({ token: null, user: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),

      role: () => get().user?.role ?? null,
    }),
    {
      name: "bengkelhub-auth",
      // Only persist token & user, not functions
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
