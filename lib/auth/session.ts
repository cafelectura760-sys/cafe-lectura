import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { AuthSessionContext, UserProfile } from "@/lib/auth/types";

function isMissingSessionError(
  error: { name?: string; message?: string } | null,
) {
  return (
    error?.name === "AuthSessionMissingError" ||
    error?.message === "Auth session missing!"
  );
}

async function getProfileForUser(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, membership_expires_at, created_at")
    .eq("id", userId)
    .maybeSingle<UserProfile>();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  return data;
}

export const getAuthSession = cache(
  async (): Promise<AuthSessionContext | null> => {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      if (isMissingSessionError(error)) {
        return null;
      }

      throw new Error(`Failed to load authenticated user: ${error.message}`);
    }

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email ?? null,
      profile: await getProfileForUser(user.id),
    };
  },
);

export async function requireAuthenticatedUser(): Promise<AuthSessionContext> {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireProfile(): Promise<
  AuthSessionContext & { profile: UserProfile }
> {
  const session = await requireAuthenticatedUser();

  if (!session.profile) {
    throw new Error("Authenticated user does not have a matching profile row.");
  }

  return {
    ...session,
    profile: session.profile,
  };
}

export async function requireAdmin(): Promise<
  AuthSessionContext & { profile: UserProfile }
> {
  const session = await requireProfile();

  if (session.profile.role !== "admin") {
    redirect("/");
  }

  return session;
}

export async function requireActiveMembership(): Promise<
  AuthSessionContext & { profile: UserProfile }
> {
  const session = await requireProfile();
  const membershipExpiresAt = new Date(session.profile.membership_expires_at);

  if (session.profile.role === "admin") {
    return session;
  }

  if (membershipExpiresAt <= new Date()) {
    redirect("/membership-expired");
  }

  return session;
}
