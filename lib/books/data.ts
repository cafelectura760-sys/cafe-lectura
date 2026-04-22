import "server-only";

import { createClient } from "@/lib/supabase/server";

type BookRow = {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  cover_image_url: string;
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

export async function getPublicBooks(): Promise<PublicBook[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, synopsis, cover_image_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load public books: ${error.message}`);
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
