import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  setToken: (token: string) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
}

const decodeToken = (token: string): User | null => {
  try {
    const base64Url = token.split(".")[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if missing
    const pad = base64.length % 4;
    if (pad) {
      if (pad === 1) throw new Error("Invalid base64");
      base64 += new Array(5 - pad).join("=");
    }

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    const payload = JSON.parse(jsonPayload);
    // Backend uses email as sub/subject and userId for id in JWT
    return {
      email: payload.sub,
      id: payload.userId,
    };
  } catch (e) {
    console.error("Failed to decode token:", e);
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      user: null,

      setToken: (token: string, userData?: any) => {
        // If userData is provided (e.g. from login/refresh response body), use it.
        // Otherwise, decode the token as a fallback.
        let user = userData || decodeToken(token);
        
        // Map backend 'username' to 'displayName' if needed by FE components
        if (user && user.username && !user.displayName) {
          user = { ...user, displayName: user.username };
        }
        
        set({ accessToken: token, isAuthenticated: true, user });
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      logout: () => {
        // Cookie is cleared by the backend
        set({ accessToken: null, isAuthenticated: false, user: null });
        // Clear storage explicitly to be safe
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage", // unique name for the item in storage
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
