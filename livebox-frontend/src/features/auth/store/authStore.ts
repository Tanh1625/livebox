import { create } from 'zustand';

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
    const base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if missing
    const pad = base64.length % 4;
    if (pad) {
      if (pad === 1) throw new Error('Invalid base64');
      base64 += new Array(5 - pad).join('=');
    }

    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    // Backend uses email as sub/subject and userId for id in JWT
    return { 
      email: payload.sub,
      id: payload.userId
    };
  } catch (e) {
    console.error('Failed to decode token:', e);
    return null;
  }
};

const initialToken = localStorage.getItem('access_token');

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!initialToken,
  accessToken: initialToken,
  user: initialToken ? decodeToken(initialToken) : null,
  
  setToken: (token: string) => {
    localStorage.setItem('access_token', token);
    const user = decodeToken(token);
    set({ accessToken: token, isAuthenticated: true, user });
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    set({ accessToken: null, isAuthenticated: false, user: null });
  }
}));
