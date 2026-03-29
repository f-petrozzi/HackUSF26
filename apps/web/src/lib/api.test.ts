import type { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { refreshSessionUser } from "@/lib/api";
import { apiClient } from "@/lib/api-client";
import { storageKeys } from "@/lib/config";

function makeAxiosError(status: number, detail?: string): AxiosError {
  return {
    isAxiosError: true,
    name: "AxiosError",
    message: detail ?? `Request failed with status ${status}`,
    toJSON: () => ({}),
    response: {
      status,
      statusText: "",
      headers: {},
      config: { headers: {} },
      data: detail ? { detail } : undefined,
    },
  } as AxiosError;
}

function mockResponse<T>(data: T) {
  return { data } as { data: T };
}

describe("refreshSessionUser", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("keeps the signed-in user when profile enrichment fails", async () => {
    const getSpy = vi.spyOn(apiClient, "get");
    getSpy
      .mockResolvedValueOnce(mockResponse({ id: 7, email: "member@example.com", role: "member", has_profile: true }))
      .mockRejectedValueOnce(makeAxiosError(500, "Profile query failed"));

    const user = await refreshSessionUser("Member Example");

    expect(user).toEqual({
      id: "7",
      email: "member@example.com",
      full_name: "Member Example",
      role: "member",
      persona: undefined,
      onboarded: true,
    });
    expect(getSpy).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem(storageKeys.user)).toBe(JSON.stringify(user));
  });

  it("still fails when the Clerk-backed auth lookup fails", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockRejectedValueOnce(makeAxiosError(401, "Invalid Clerk session token"));

    await expect(refreshSessionUser()).rejects.toMatchObject({
      response: { status: 401, data: { detail: "Invalid Clerk session token" } },
    });
    expect(getSpy).toHaveBeenCalledTimes(1);
  });
});
