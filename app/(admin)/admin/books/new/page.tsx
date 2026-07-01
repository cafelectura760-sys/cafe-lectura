import type { Metadata } from "next";

import { AdminFeedbackBanner } from "@/components/admin/admin-feedback";
import { BookCreateForm } from "@/components/admin/book-create-form";
import { getAdminFeedbackMessage } from "@/lib/admin/ui";

type AdminBooksCreatePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Nuevo libro",
  description: "Alta manual de entradas del catálogo.",
};

export default async function AdminBooksCreatePage({
  searchParams,
}: AdminBooksCreatePageProps) {
  const feedback = getAdminFeedbackMessage(await searchParams);

  return (
    <>
      {feedback ? <AdminFeedbackBanner feedback={feedback} /> : null}
      <BookCreateForm />
    </>
  );
}
