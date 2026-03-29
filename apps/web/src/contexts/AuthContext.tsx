import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth as useClerkAuth, useClerk, useUser } from "@clerk/clerk-react";

import { getStoredUser, refreshSessionUser } from "@/lib/api";
import { clearStoredSession, setAccessTokenProvider, setStoredUser } from "@/lib/api-client";
import { appConfig } from "@/lib/config";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
  isLoading: boolean;
}

type ClerkUser = NonNullable<ReturnType<typeof useUser>["user"]>;

const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
  logout: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

function inferNameFromEmail(email: string): string {
  const local = email.split("@")[0] || "CareMesh User";
  return local
    .replace(/[._+]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function readMetadata(user: ClerkUser, key: string): unknown {
  return user.publicMetadata?.[key] ?? user.unsafeMetadata?.[key];
}

function mapClerkUser(user: ClerkUser): User {
  const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || "";
  const rawPersona = readMetadata(user, "persona_type");
  const rawOnboarded = readMetadata(user, "onboarded");

  return {
    id: user.id,
    email,
    full_name: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ") || inferNameFromEmail(email),
    role: "member",
    persona: typeof rawPersona === "string" ? (rawPersona as User["persona"]) : undefined,
    onboarded: rawOnboarded === true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { getToken } = useClerkAuth();
  const { isLoaded, user: clerkUser } = useUser();
  const clerk = useClerk();
  const [user, setResolvedUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setAccessTokenProvider(appConfig.useMockApi ? null : async () => (await getToken()) || null);
    return () => setAccessTokenProvider(null);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!clerkUser) {
      clearStoredSession();
      setResolvedUser(null);
      return;
    }

    const fallbackUser = mapClerkUser(clerkUser);
    if (appConfig.useMockApi) {
      setStoredUser(fallbackUser);
      setResolvedUser(fallbackUser);
      return;
    }

    let cancelled = false;
    setIsSyncing(true);
    refreshSessionUser(fallbackUser.full_name)
      .then((nextUser) => {
        if (!cancelled) {
          setStoredUser(nextUser);
          setResolvedUser(nextUser);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStoredUser(fallbackUser);
          setResolvedUser(fallbackUser);
        }
      })
      .finally(() => {
        if (!cancelled) setIsSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clerkUser, isLoaded]);

  const setUser = (nextUser: User | null) => {
    if (!nextUser) {
      clearStoredSession();
      setResolvedUser(null);
      return;
    }
    if (!clerkUser) return;

    setStoredUser(nextUser);
    setResolvedUser(nextUser);

    void clerkUser.update({
      firstName: nextUser.full_name.split(" ")[0] || undefined,
      lastName: nextUser.full_name.split(" ").slice(1).join(" ") || undefined,
      unsafeMetadata: {
        ...clerkUser.unsafeMetadata,
        onboarded: nextUser.onboarded,
        persona_type: nextUser.persona,
      },
    });
  };

  const logout = () => {
    clearStoredSession();
    void clerk.signOut({ redirectUrl: "/login" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        isLoading: !isLoaded || isSyncing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
