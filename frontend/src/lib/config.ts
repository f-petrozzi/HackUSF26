const DEFAULT_API_URL = "http://localhost:8000";

function parseMockFlag(value: string | undefined): boolean {
  if (!value) return true;
  return value.toLowerCase() !== "false";
}

export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL,
  useMockApi: parseMockFlag(import.meta.env.VITE_USE_MOCK_API),
  clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() || "",
};

export const storageKeys = {
  token: "caremesh_token",
  user: "caremesh_user",
} as const;
