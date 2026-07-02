import "server-only";

import { createClient } from "@/lib/supabase/server";

type BookRow = {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  cover_image_url: string;
  status: "published" | "hidden";
  created_at: string;
};

export type PublicBook = {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  coverImageUrl: string;
  createdAt: string;
};

export type PublicBookDetail = PublicBook & {
  publishedColloquiumCount: number;
};

function mapPublicBook(book: BookRow): PublicBook {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    synopsis: book.synopsis,
    coverImageUrl: book.cover_image_url,
    createdAt: book.created_at,
  };
}

export async function getPublicBooks(): Promise<PublicBook[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, synopsis, cover_image_url, status, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load public books: ${error.message}`);
  }

  return (data satisfies BookRow[]).map(mapPublicBook);
}

export async function getPublicBookById(
  id: string,
): Promise<PublicBookDetail | null> {
  const supabase = await createClient();
  const [bookResult, colloquiumsResult] = await Promise.all([
    supabase
      .from("books")
      .select(
        "id, title, author, synopsis, cover_image_url, status, created_at",
      )
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle<BookRow>(),
    supabase
      .from("colloquiums")
      .select("id", { count: "exact", head: true })
      .eq("book_id", id)
      .eq("status", "published"),
  ]);

  if (bookResult.error) {
    throw new Error(
      `Failed to load public book detail: ${bookResult.error.message}`,
    );
  }

  if (colloquiumsResult.error) {
    throw new Error(
      `Failed to count linked colloquiums for public book detail: ${colloquiumsResult.error.message}`,
    );
  }

  if (!bookResult.data) {
    return null;
  }

  return {
    ...mapPublicBook(bookResult.data),
    publishedColloquiumCount: colloquiumsResult.count ?? 0,
  };
}
