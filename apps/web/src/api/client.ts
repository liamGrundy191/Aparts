import type { AuthResponse } from '@aparts/shared';
import axios, { HttpStatusCode, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

// The access token lives in memory only; the refresh token is an httpOnly cookie set by the API.
let accessToken: string | null = null;
// Shared by every caller: the API rotates the refresh token, so a second concurrent refresh would be rejected.
let refreshPromise: Promise<AuthResponse> | null = null;
let logoutFunction: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function setLogoutFunction(func: (() => void) | null) {
  logoutFunction = func;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// On a 401, refresh the access token and retry the original request once.
api.interceptors.response.use(undefined, async (error) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
  const isAuthCall = original?.url === '/auth/refresh' || original?.url === '/auth/login';
  if (error.response?.status !== HttpStatusCode.Unauthorized || !original || original._retried || isAuthCall) {
    throw error;
  }
  original._retried = true;
  try {
    await refreshRequest();
  } catch (err) {
    logoutFunction?.();
    throw err;
  }
  return api(original);
});

export const loginRequest = async (email: string, password: string): Promise<AuthResponse> => {
  const res: AxiosResponse<AuthResponse> = await api.post("/auth/login", { email, password });
  setAccessToken(res.data.accessToken);
  return res.data;
};

export const logoutRequest = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const refreshRequest = (): Promise<AuthResponse> => {
  refreshPromise ??= api
    .post<AuthResponse>('/auth/refresh')
    .then((res) => {
      setAccessToken(res.data.accessToken);
      return res.data;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};
