import type { Metadata } from "next";

import { AdminFeedbackBanner } from "@/components/admin/admin-feedback";
import { BooksManagement } from "@/components/admin/books-management";
import { listAdminBooksPage } from "@/lib/admin/book-management";
import {
  createAdminPath,
  getAdminFeedbackMessage,
  getAdminPaginationParams,
} from "@/lib/admin/ui";

type BooksPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Libros",
  description: "Gestión administrativa del catálogo de libros.",
};

export default async function AdminBooksPage({ searchParams }: BooksPageProps) {
  const resolvedSearchParams = await searchParams;
  const feedback = getAdminFeedbackMessage(resolvedSearchParams);
  const paginationParams = getAdminPaginationParams(resolvedSearchParams);
  const books = await listAdminBooksPage(paginationParams);
  const currentPath = createAdminPath("/admin/books", {
    page: books.page,
    size: books.size,
  });

  return (
    <>
      {feedback ? <AdminFeedbackBanner feedback={feedback} /> : null}
      <BooksManagement booksPage={books} currentPath={currentPath} />
    </>
  );
}
