import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type AdminBookActionErrorCode =
  | "invalid-book-title"
  | "invalid-book-author"
  | "invalid-book-synopsis"
  | "invalid-book-cover-image-url"
  | "book-not-found";

type BookRow = {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  cover_image_url: string;
  created_at: string;
};

export type AdminBookRecord = {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  coverImageUrl: string;
  createdAt: string;
};

export type CreateAdminBookInput = {
  title: string;
  author: string;
  synopsis: string;
  coverImageUrl: string;
};

export type UpdateAdminBookInput = CreateAdminBookInput & {
  bookId: string;
};

export class AdminBookActionError extends Error {
  constructor(public readonly code: AdminBookActionErrorCode) {
    super(code);
    this.name = "AdminBookActionError";
  }
}

function normalizeRequiredText(
  value: string,
  errorCode:
    | "invalid-book-title"
    | "invalid-book-author"
    | "invalid-book-synopsis",
): string {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new AdminBookActionError(errorCode);
  }

  return normalizedValue;
}

function normalizeCoverImageUrl(value: string): string {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new AdminBookActionError("invalid-book-cover-image-url");
  }

  try {
    const parsedUrl = new URL(normalizedValue);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("invalid protocol");
    }
  } catch {
    throw new AdminBookActionError("invalid-book-cover-image-url");
  }

  return normalizedValue;
}

export async function listAdminBooks(): Promise<AdminBookRecord[]> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, synopsis, cover_image_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load books: ${error.message}`);
  }

  return (data satisfies BookRow[]).map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    synopsis: book.synopsis,
    coverImageUrl: book.cover_image_url,
    createdAt: book.created_at,
  }));
}

export async function createAdminBook(input: CreateAdminBookInput) {
  await requireAdmin();

  const supabase = await createClient();
  const title = normalizeRequiredText(input.title, "invalid-book-title");
  const author = normalizeRequiredText(input.author, "invalid-book-author");
  const synopsis = normalizeRequiredText(
    input.synopsis,
    "invalid-book-synopsis",
  );
  const coverImageUrl = normalizeCoverImageUrl(input.coverImageUrl);

  const { error } = await supabase.from("books").insert({
    title,
    author,
    synopsis,
    cover_image_url: coverImageUrl,
  });

  if (error) {
    throw new Error(`Failed to create book: ${error.message}`);
  }
}

export async function updateAdminBook(input: UpdateAdminBookInput) {
  await requireAdmin();

  const supabase = await createClient();
  const bookId = input.bookId.trim();
  const title = normalizeRequiredText(input.title, "invalid-book-title");
  const author = normalizeRequiredText(input.author, "invalid-book-author");
  const synopsis = normalizeRequiredText(
    input.synopsis,
    "invalid-book-synopsis",
  );
  const coverImageUrl = normalizeCoverImageUrl(input.coverImageUrl);

  if (!bookId) {
    throw new AdminBookActionError("book-not-found");
  }

  const { data: existingBook, error: selectError } = await supabase
    .from("books")
    .select("id")
    .eq("id", bookId)
    .maybeSingle<{ id: string }>();

  if (selectError) {
    throw new Error(`Failed to load book: ${selectError.message}`);
  }

  if (!existingBook) {
    throw new AdminBookActionError("book-not-found");
  }

  const { error: updateError } = await supabase
    .from("books")
    .update({
      title,
      author,
      synopsis,
      cover_image_url: coverImageUrl,
    })
    .eq("id", bookId);

  if (updateError) {
    throw new Error(`Failed to update book: ${updateError.message}`);
  }
}
