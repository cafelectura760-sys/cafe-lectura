import "server-only";

import { createClient } from "@/lib/supabase/server";

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
  author: string;
  cover_image_url: string;
};

export type ColloquiumSummary = {
  id: string;
  title: string;
  content: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverImageUrl: string;
  publishedAt: string;
};

export type ColloquiumDetail = ColloquiumSummary;

async function getBooksLookup() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, cover_image_url");

  if (error) {
    throw new Error(`Failed to load colloquium books: ${error.message}`);
  }

  return new Map(
    (data satisfies BookLookupRow[]).map((book) => [
      book.id,
      {
        title: book.title,
        author: book.author,
        coverImageUrl: book.cover_image_url,
      },
    ]),
  );
}

function mapColloquiumRecord(
  colloquium: ColloquiumRow,
  booksById: Map<
    string,
    {
      title: string;
      author: string;
      coverImageUrl: string;
    }
  >,
): ColloquiumSummary {
  const relatedBook = booksById.get(colloquium.book_id);

  return {
    id: colloquium.id,
    title: colloquium.title,
    content: colloquium.content,
    bookId: colloquium.book_id,
    bookTitle: relatedBook?.title ?? "Libro no disponible",
    bookAuthor: relatedBook?.author ?? "Autor no disponible",
    bookCoverImageUrl: relatedBook?.coverImageUrl ?? "",
    publishedAt: colloquium.published_at,
  };
}

export async function getAvailableColloquiums(): Promise<ColloquiumSummary[]> {
  const supabase = await createClient();
  const booksByIdPromise = getBooksLookup();
  const { data, error } = await supabase
    .from("colloquiums")
    .select("id, title, content, book_id, published_at")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load colloquiums: ${error.message}`);
  }

  const booksById = await booksByIdPromise;

  return (data satisfies ColloquiumRow[]).map((colloquium) =>
    mapColloquiumRecord(colloquium, booksById),
  );
}

export async function getColloquiumById(
  colloquiumId: string,
): Promise<ColloquiumDetail | null> {
  const supabase = await createClient();
  const booksByIdPromise = getBooksLookup();
  const { data, error } = await supabase
    .from("colloquiums")
    .select("id, title, content, book_id, published_at")
    .eq("id", colloquiumId)
    .maybeSingle<ColloquiumRow>();

  if (error) {
    throw new Error(`Failed to load colloquium detail: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const booksById = await booksByIdPromise;

  return mapColloquiumRecord(data, booksById);
}
