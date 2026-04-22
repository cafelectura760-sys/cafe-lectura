"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  AdminMemberActionError,
  createAdminMember,
  extendAdminMemberMembership,
  updateAdminMember,
} from "@/lib/admin/member-management";

function redirectToAdmin(key: "status" | "error", value: string): never {
  redirect(`/admin?${key}=${encodeURIComponent(value)}`);
}

function getStringEntry(
  value: FormDataEntryValue | null,
  fallbackErrorCode: string,
): string {
  if (typeof value !== "string") {
    redirectToAdmin("error", fallbackErrorCode);
  }

  return value;
}

function handleAdminActionError(error: unknown): never {
  if (error instanceof AdminMemberActionError) {
    redirectToAdmin("error", error.code);
  }

  throw error;
}

export async function createMemberAction(formData: FormData) {
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
    handleAdminActionError(error);
  }

  revalidatePath("/admin");
  redirectToAdmin("status", "member-created");
}

export async function updateMemberAction(formData: FormData) {
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
    handleAdminActionError(error);
  }

  revalidatePath("/admin");
  redirectToAdmin("status", "member-updated");
}

export async function extendMembershipAction(formData: FormData) {
  try {
    await extendAdminMemberMembership(
      getStringEntry(formData.get("member_id"), "member-not-found"),
    );
  } catch (error) {
    handleAdminActionError(error);
  }

  revalidatePath("/admin");
  redirectToAdmin("status", "membership-extended");
}
