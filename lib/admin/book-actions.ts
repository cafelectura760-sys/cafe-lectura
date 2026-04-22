"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  AdminBookActionError,
  createAdminBook,
  updateAdminBook,
} from "@/lib/admin/book-management";

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

function handleBookActionError(error: unknown): never {
  if (error instanceof AdminBookActionError) {
    redirectToAdmin("error", error.code);
  }

  throw error;
}

export async function createBookAction(formData: FormData) {
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
    handleBookActionError(error);
  }

  revalidatePath("/admin");
  redirectToAdmin("status", "book-created");
}

export async function updateBookAction(formData: FormData) {
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
    handleBookActionError(error);
  }

  revalidatePath("/admin");
  redirectToAdmin("status", "book-updated");
}
