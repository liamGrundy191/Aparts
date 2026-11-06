import type { AuthUser } from '@aparts/shared';
import axios, { HttpStatusCode } from 'axios';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest, logoutRequest, refreshRequest, setAccessToken, setLogoutFunction } from '../api/client';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string) => Promise<void>;
  error: string;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = async (email: string, password: string) => {
    setError("");
    try {
      const res = await loginRequest(email, password);
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

  const logoutUtil = () => {
    setUser(null);
    setAccessToken(null);
    navigate('/login');
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      // so error doesnt show up in console
    } finally {
      logoutUtil();
    }
  };

  const refreshOnMount = async () => {
    setIsLoading(true);
    try {
      const res = await refreshRequest();
      setUser(res.user);
    } catch (err) {
      // A 401 just means "not logged in", the normal case for a new visitor, so only server/network failures are shown.
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      if (!status || status >= HttpStatusCode.InternalServerError) {
        setError("Couldn't reach the server, please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLogoutFunction(logoutUtil);
    refreshOnMount();
    return () => {
      setLogoutFunction(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, login, error, logout }}>{children}</AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
