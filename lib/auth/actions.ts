"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type LoginErrorCode = "missing-fields" | "invalid-credentials" | "unexpected";

function redirectToLogin(error: LoginErrorCode): never {
  redirect(`/login?error=${error}`);
}

function getStringEntry(
  value: FormDataEntryValue | null,
  errorCode: LoginErrorCode,
): string {
  if (typeof value !== "string") {
    redirectToLogin(errorCode);
  }

  return value;
}

export async function loginAction(formData: FormData) {
  const rawEmail = getStringEntry(formData.get("email"), "missing-fields");
  const rawPassword = getStringEntry(
    formData.get("password"),
    "missing-fields",
  );

  const normalizedEmail = rawEmail.trim().toLowerCase();
  const password = rawPassword;

  if (!normalizedEmail || !password) {
    redirectToLogin("missing-fields");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.user) {
    redirectToLogin("invalid-credentials");
  }

  const user = data.user;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, membership_expires_at")
    .eq("id", user.id)
    .maybeSingle<{ role: "admin" | "member"; membership_expires_at: string }>();

  if (profileError || !profile) {
    redirectToLogin("unexpected");
  }

  const resolvedProfile = profile;

  if (resolvedProfile.role === "admin") {
    redirect("/admin");
  }

  const membershipExpiry = new Date(resolvedProfile.membership_expires_at);

  if (membershipExpiry > new Date()) {
    redirect("/colloquiums");
  }

  redirect("/membership-expired");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
