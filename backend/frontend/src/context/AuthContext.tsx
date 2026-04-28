import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { startConnection, stopConnection } from '../services/signalr';

interface AuthUser {
  userName: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  profilePhotoUrl: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userName: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; userName: string; password: string; email: string }) => Promise<string>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.validateToken();
      if (res.data.isValid) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          await startConnection(token);
        }
      } else {
        localStorage.clear();
      }
    } catch {
      localStorage.clear();
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (userName: string, password: string) => {
    const res = await authApi.login({ userName, password });
    if (res.data.isSucceeded) {
      const d = res.data.data;
      localStorage.setItem('accessToken', d.accessToken);
      localStorage.setItem('refreshToken', d.refreshToken);
      const authUser: AuthUser = {
        userName: d.userName,
        firstName: d.firstName,
        lastName: d.lastName,
        isEmailVerified: d.isEmailVerified,
        isProfileCompleted: d.isProfileCompleted,
        profilePhotoUrl: d.profilePhotoUrl,
      };
      localStorage.setItem('user', JSON.stringify(authUser));
      setUser(authUser);
      await startConnection(d.accessToken);
    } else {
      throw new Error(res.data.message);
    }
  };

  const register = async (data: { firstName: string; lastName: string; userName: string; password: string; email: string }) => {
    const res = await authApi.register(data);
    if (res.data.isSucceeded) {
      return res.data.message;
    }
    throw new Error(res.data.message);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch { /* ignore */ }
    stopConnection();
    localStorage.clear();
    setUser(null);
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
