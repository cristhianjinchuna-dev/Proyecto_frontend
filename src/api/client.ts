import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';
import type { AuthResponse } from '../types/auth';

const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ---------- Request: add the JWT ----------
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- EP 005 - refresh token ----------
let refreshPromise: Promise<string> | null = null;
let onSessionExpired: (() => void) | null = null;

// AuthContext registers what to do when the session can't be renewed
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

// Uses plain axios (not `api`) so this call never goes through the interceptors
export async function refreshAccessToken(): Promise<AuthResponse> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const { data } = await axios.post<AuthResponse>(
    `${baseURL}/auth/refresh`,
    { refreshToken },
    { timeout: 15000 },
  );
  tokenStorage.saveSession(data.token, data.refreshToken, { id: data.id, role: data.rol });
  return data;
}

// If several requests get 401 at the same time, only ONE refresh is made
function refreshOnce(): Promise<string> {
  refreshPromise ??= refreshAccessToken()
    .then((data) => data.token)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

// ---------- Response: on 401, refresh and retry once ----------
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequest | undefined;
    const isAuthEndpoint = original?.url?.startsWith('/auth/');

    const shouldTryRefresh =
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint &&
      tokenStorage.getRefreshToken();

    if (!shouldTryRefresh) return Promise.reject(error);

    original._retry = true;
    try {
      const newToken = await refreshOnce();
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original); // retry the original request with the new token
    } catch {
      tokenStorage.clear();
      onSessionExpired?.(); // AuthContext logs the user out
      return Promise.reject(error);
    }
  },
);