"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  AdminMemberActionError,
  createAdminMember,
  extendAdminMemberMembership,
  updateAdminMember,
} from "@/lib/admin/member-management";

function redirectWithFeedback(
  path: string,
  key: "status" | "error",
  value: string,
): never {
  const url = new URL(path, "http://localhost");
  url.searchParams.set(key, value);
  redirect(`${url.pathname}${url.search}`);
}

function getStringEntry(
  value: FormDataEntryValue | null,
  fallbackErrorCode: string,
): string {
  if (typeof value !== "string") {
    redirectWithFeedback("/admin/members", "error", fallbackErrorCode);
  }

  return value;
}

function normalizeRedirectPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/admin/members";
  }

  return value;
}

function normalizeOptionalRedirectPath(
  value: FormDataEntryValue | null,
  fallbackPath: string,
): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return fallbackPath;
  }

  return value;
}

function handleAdminActionError(error: unknown, path: string): never {
  if (error instanceof AdminMemberActionError) {
    redirectWithFeedback(path, "error", error.code);
  }

  throw error;
}

export async function createMemberAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const successRedirectPath = normalizeOptionalRedirectPath(
    formData.get("success_redirect_to"),
    redirectPath,
  );

  try {
    await createAdminMember({
      fullName: getStringEntry(formData.get("full_name"), "invalid-full-name"),
      email: getStringEntry(formData.get("email"), "invalid-email"),
      password: getStringEntry(formData.get("password"), "invalid-password"),
      role: getStringEntry(formData.get("role"), "invalid-role"),
      membershipDate: getStringEntry(
        formData.get("membership_date"),
        "invalid-membership-date",
      ),
    });
  } catch (error) {
    handleAdminActionError(error, redirectPath);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/members");
  redirectWithFeedback(successRedirectPath, "status", "member-created");
}

export async function updateMemberAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));

  try {
    await updateAdminMember({
      memberId: getStringEntry(formData.get("member_id"), "member-not-found"),
      role: getStringEntry(formData.get("role"), "invalid-role"),
      membershipDate: getStringEntry(
        formData.get("membership_date"),
        "invalid-membership-date",
      ),
    });
  } catch (error) {
    handleAdminActionError(error, redirectPath);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/members");
  redirectWithFeedback(redirectPath, "status", "member-updated");
}

export async function extendMembershipAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));

  try {
    await extendAdminMemberMembership(
      getStringEntry(formData.get("member_id"), "member-not-found"),
    );
  } catch (error) {
    handleAdminActionError(error, redirectPath);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/members");
  redirectWithFeedback(redirectPath, "status", "membership-extended");
}
