import type { Metadata } from "next";

import { AdminFeedbackBanner } from "@/components/admin/admin-feedback";
import { BooksManagement } from "@/components/admin/books-management";
import { listAdminBooks } from "@/lib/admin/book-management";
import { getAdminFeedbackMessage } from "@/lib/admin/ui";

type BooksPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Libros",
  description: "Gestión administrativa del catálogo de libros.",
};

export default async function AdminBooksPage({ searchParams }: BooksPageProps) {
  const [books, resolvedSearchParams] = await Promise.all([
    listAdminBooks(),
    searchParams,
  ]);
  const feedback = getAdminFeedbackMessage(resolvedSearchParams);

  return (
    <>
      {feedback ? <AdminFeedbackBanner feedback={feedback} /> : null}
      <BooksManagement books={books} />
    </>
  );
}
