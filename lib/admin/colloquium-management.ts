import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type AdminColloquiumActionErrorCode =
  | "invalid-colloquium-title"
  | "invalid-colloquium-content"
  | "invalid-colloquium-book-id"
  | "invalid-colloquium-published-at"
  | "colloquium-not-found";

type ColloquiumRow = {
  id: string;
  title: string;
  content: string;
  book_id: string;
  published_at: string;
};

type BookLookupRow = {
  id: string;
  title: string;
};

export type AdminColloquiumRecord = {
  id: string;
  title: string;
  content: string;
  bookId: string;
  bookTitle: string;
  publishedAt: string;
};

export type CreateAdminColloquiumInput = {
  title: string;
  content: string;
  bookId: string;
  publishedAt?: string;
};

export type UpdateAdminColloquiumInput = CreateAdminColloquiumInput & {
  colloquiumId: string;
};

export class AdminColloquiumActionError extends Error {
  constructor(public readonly code: AdminColloquiumActionErrorCode) {
    super(code);
    this.name = "AdminColloquiumActionError";
  }
}

function normalizeRequiredText(
  value: string,
  errorCode: "invalid-colloquium-title" | "invalid-colloquium-content",
): string {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new AdminColloquiumActionError(errorCode);
  }

  return normalizedValue;
}

function normalizeBookId(value: string): string {
  const bookId = value.trim();

  if (!bookId) {
    throw new AdminColloquiumActionError("invalid-colloquium-book-id");
  }

  return bookId;
}

function parsePublishedAtToIso(value?: string): string {
  if (!value) {
    return new Date().toISOString();
  }

  const publishedAt = new Date(value);

  if (Number.isNaN(publishedAt.getTime())) {
    throw new AdminColloquiumActionError("invalid-colloquium-published-at");
  }

  return publishedAt.toISOString();
}

function formatDateTimeLocalInputValue(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, "0");

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join("T");
}

export function getDefaultPublishedAtInput(): string {
  return formatDateTimeLocalInputValue(new Date());
}

export function getPublishedAtInputValue(isoDate: string): string {
  return formatDateTimeLocalInputValue(new Date(isoDate));
}

async function assertBookExists(bookId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("id")
    .eq("id", bookId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(`Failed to load related book: ${error.message}`);
  }

  if (!data) {
    throw new AdminColloquiumActionError("invalid-colloquium-book-id");
  }
}

export async function listAdminColloquiums(): Promise<AdminColloquiumRecord[]> {
  await requireAdmin();

  const supabase = await createClient();
  const [
    { data: colloquiums, error: colloquiumsError },
    { data: books, error: booksError },
  ] = await Promise.all([
    supabase
      .from("colloquiums")
      .select("id, title, content, book_id, published_at")
      .order("published_at", { ascending: false }),
    supabase.from("books").select("id, title"),
  ]);

  if (colloquiumsError) {
    throw new Error(`Failed to load colloquiums: ${colloquiumsError.message}`);
  }

  if (booksError) {
    throw new Error(
      `Failed to load books for colloquiums: ${booksError.message}`,
    );
  }

  const booksById = new Map(
    (books satisfies BookLookupRow[]).map((book) => [book.id, book.title]),
  );

  return (colloquiums satisfies ColloquiumRow[]).map((colloquium) => ({
    id: colloquium.id,
    title: colloquium.title,
    content: colloquium.content,
    bookId: colloquium.book_id,
    bookTitle: booksById.get(colloquium.book_id) ?? "Libro no disponible",
    publishedAt: colloquium.published_at,
  }));
}

export async function createAdminColloquium(input: CreateAdminColloquiumInput) {
  await requireAdmin();

  const supabase = await createClient();
  const title = normalizeRequiredText(input.title, "invalid-colloquium-title");
  const content = normalizeRequiredText(
    input.content,
    "invalid-colloquium-content",
  );
  const bookId = normalizeBookId(input.bookId);
  const publishedAt = parsePublishedAtToIso(input.publishedAt);

  await assertBookExists(bookId);

  const { error } = await supabase.from("colloquiums").insert({
    title,
    content,
    book_id: bookId,
    published_at: publishedAt,
  });

  if (error) {
    throw new Error(`Failed to create colloquium: ${error.message}`);
  }
}

export async function updateAdminColloquium(input: UpdateAdminColloquiumInput) {
  await requireAdmin();

  const supabase = await createClient();
  const colloquiumId = input.colloquiumId.trim();
  const title = normalizeRequiredText(input.title, "invalid-colloquium-title");
  const content = normalizeRequiredText(
    input.content,
    "invalid-colloquium-content",
  );
  const bookId = normalizeBookId(input.bookId);
  const publishedAt = parsePublishedAtToIso(input.publishedAt);

  if (!colloquiumId) {
    throw new AdminColloquiumActionError("colloquium-not-found");
  }

  await assertBookExists(bookId);

  const { data: existingColloquium, error: selectError } = await supabase
    .from("colloquiums")
    .select("id")
    .eq("id", colloquiumId)
    .maybeSingle<{ id: string }>();

  if (selectError) {
    throw new Error(`Failed to load colloquium: ${selectError.message}`);
  }

  if (!existingColloquium) {
    throw new AdminColloquiumActionError("colloquium-not-found");
  }

  const { error: updateError } = await supabase
    .from("colloquiums")
    .update({
      title,
      content,
      book_id: bookId,
      published_at: publishedAt,
    })
    .eq("id", colloquiumId);

  if (updateError) {
    throw new Error(`Failed to update colloquium: ${updateError.message}`);
  }
}
