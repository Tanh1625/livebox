import { create } from "zustand";

interface User {
  id: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: User | null;
  setToken: (token: string) => void;
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

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  accessToken: null,
  user: null,

  setToken: (token: string) => {
    // Note: Refresh token is handled by HTTPOnly cookie automatically via backend Set-Cookie
    const user = decodeToken(token);
    set({ accessToken: token, isAuthenticated: true, user });
  },

  logout: () => {
    // Cookie is cleared by the backend
    set({ accessToken: null, isAuthenticated: false, user: null });
  },
}));
