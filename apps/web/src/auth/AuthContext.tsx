import type { AuthUser } from '@aparts/shared';
import axios, { HttpStatusCode } from 'axios';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest, setAccessToken } from '../api/client';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  error: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const isLoading = false;

  const login = async (email: string, password: string) => {
    setError("");
    try {
      const res = await loginRequest(email, password);
      setAccessToken(res.accessToken);
      setUser(res.user)
      navigate(`/${res.user.role.toLowerCase()}`);
    } catch (err) {
      setError(
        axios.isAxiosError(err) && err.response?.status === HttpStatusCode.Unauthorized
          ? 'Email or password is incorrect'
          : 'Something went wrong, please try again',
      );
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, login, error }}>{children}</AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
