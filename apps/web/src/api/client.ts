import type { AuthResponse } from '@aparts/shared';
import axios from 'axios';

// The access token lives in memory only; the refresh token is an httpOnly cookie set by the API.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

export const loginRequest = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

// TODO (milestone 2): add a response interceptor that calls POST /auth/refresh on 401,
// stores the new access token, and retries the original request once.
