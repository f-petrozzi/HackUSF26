import axios from "axios";

import { appConfig, storageKeys } from "@/lib/config";
import type { User } from "@/lib/types";

type AccessTokenProvider = (() => Promise<string | null>) | null;

let accessTokenProvider: AccessTokenProvider = null;

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
});

apiClient.interceptors.request.use(async (config) => {
  const token = (accessTokenProvider ? await accessTokenProvider() : null) || getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setAccessTokenProvider(provider: AccessTokenProvider) {
  accessTokenProvider = provider;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(storageKeys.token);
}

export function setStoredToken(token: string) {
  localStorage.setItem(storageKeys.token, token);
}

export function getStoredUser(): User | null {
  const stored = localStorage.getItem(storageKeys.user);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as User;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function setStoredUser(user: User) {
  localStorage.setItem(storageKeys.user, JSON.stringify(user));
}

export function clearStoredSession() {
  localStorage.removeItem(storageKeys.token);
  localStorage.removeItem(storageKeys.user);
}
