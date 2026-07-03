import type { Metadata } from "next";

import { listColloquiumBookOptions } from "@/lib/colloquiums/data";
import { getColloquiumEditorFeedbackMessage } from "@/lib/colloquiums/editor-feedback";
import { requireAdmin } from "@/lib/auth/session";
import { getSupabaseColloquiumMediaBucket } from "@/lib/env/server";
import { AdminColloquiumEditor } from "@/components/colloquiums/admin-colloquium-editor";

type NewAdminColloquiumPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Nuevo coloquio",
  description: "Editor administrativo para crear un nuevo coloquio privado.",
};

export default async function NewAdminColloquiumPage({
  searchParams,
}: NewAdminColloquiumPageProps) {
  await requireAdmin();

  const [books, resolvedSearchParams, mediaBucketName] = await Promise.all([
    listColloquiumBookOptions(),
    searchParams,
    Promise.resolve(getSupabaseColloquiumMediaBucket()),
  ]);

  return (
    <AdminColloquiumEditor
      books={books}
      colloquium={null}
      feedback={getColloquiumEditorFeedbackMessage(resolvedSearchParams)}
      mediaBucketName={mediaBucketName}
      mode="create"
    />
  );
}
