"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  AdminColloquiumActionError,
  createAdminColloquium,
  updateAdminColloquium,
} from "@/lib/admin/colloquium-management";

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

function handleColloquiumActionError(error: unknown): never {
  if (error instanceof AdminColloquiumActionError) {
    redirectToAdmin("error", error.code);
  }

  throw error;
}

export async function createColloquiumAction(formData: FormData) {
  try {
    await createAdminColloquium({
      title: getStringEntry(formData.get("title"), "invalid-colloquium-title"),
      content: getStringEntry(
        formData.get("content"),
        "invalid-colloquium-content",
      ),
      bookId: getStringEntry(
        formData.get("book_id"),
        "invalid-colloquium-book-id",
      ),
      publishedAt: getStringEntry(
        formData.get("published_at"),
        "invalid-colloquium-published-at",
      ),
    });
  } catch (error) {
    handleColloquiumActionError(error);
  }

  revalidatePath("/admin");
  revalidatePath("/colloquiums");
  redirectToAdmin("status", "colloquium-created");
}

export async function updateColloquiumAction(formData: FormData) {
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );

  try {
    await updateAdminColloquium({
      colloquiumId,
      title: getStringEntry(formData.get("title"), "invalid-colloquium-title"),
      content: getStringEntry(
        formData.get("content"),
        "invalid-colloquium-content",
      ),
      bookId: getStringEntry(
        formData.get("book_id"),
        "invalid-colloquium-book-id",
      ),
      publishedAt: getStringEntry(
        formData.get("published_at"),
        "invalid-colloquium-published-at",
      ),
    });
  } catch (error) {
    handleColloquiumActionError(error);
  }

  revalidatePath("/admin");
  revalidatePath("/colloquiums");
  revalidatePath(`/colloquiums/${colloquiumId}`);
  redirectToAdmin("status", "colloquium-updated");
}
