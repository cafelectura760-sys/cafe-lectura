"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  AdminBookActionError,
  createAdminBook,
  updateAdminBook,
} from "@/lib/admin/book-management";

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
    redirectWithFeedback("/admin/books", "error", fallbackErrorCode);
  }

  return value;
}

function normalizeRedirectPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/admin/books";
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

function handleBookActionError(error: unknown, path: string): never {
  if (error instanceof AdminBookActionError) {
    redirectWithFeedback(path, "error", error.code);
  }

  throw error;
}

export async function createBookAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const successRedirectPath = normalizeOptionalRedirectPath(
    formData.get("success_redirect_to"),
    redirectPath,
  );

  try {
    await createAdminBook({
      title: getStringEntry(formData.get("title"), "invalid-book-title"),
      author: getStringEntry(formData.get("author"), "invalid-book-author"),
      synopsis: getStringEntry(
        formData.get("synopsis"),
        "invalid-book-synopsis",
      ),
      coverImageUrl: getStringEntry(
        formData.get("cover_image_url"),
        "invalid-book-cover-image-url",
      ),
    });
  } catch (error) {
    handleBookActionError(error, redirectPath);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/books");
  revalidatePath("/admin/colloquiums");
  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath("/colloquiums");
  redirectWithFeedback(successRedirectPath, "status", "book-created");
}

export async function updateBookAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));

  try {
    await updateAdminBook({
      bookId: getStringEntry(formData.get("book_id"), "book-not-found"),
      title: getStringEntry(formData.get("title"), "invalid-book-title"),
      author: getStringEntry(formData.get("author"), "invalid-book-author"),
      synopsis: getStringEntry(
        formData.get("synopsis"),
        "invalid-book-synopsis",
      ),
      coverImageUrl: getStringEntry(
        formData.get("cover_image_url"),
        "invalid-book-cover-image-url",
      ),
    });
  } catch (error) {
    handleBookActionError(error, redirectPath);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/books");
  revalidatePath("/admin/colloquiums");
  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath("/colloquiums");
  redirectWithFeedback(redirectPath, "status", "book-updated");
}
