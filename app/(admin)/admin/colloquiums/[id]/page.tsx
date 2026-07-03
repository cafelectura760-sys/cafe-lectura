import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getAdminColloquiumEditorRecord,
  listColloquiumBookOptions,
} from "@/lib/colloquiums/data";
import { getColloquiumEditorFeedbackMessage } from "@/lib/colloquiums/editor-feedback";
import { requireAdmin } from "@/lib/auth/session";
import { getSupabaseColloquiumMediaBucket } from "@/lib/env/server";
import { AdminColloquiumEditor } from "@/components/colloquiums/admin-colloquium-editor";

type AdminColloquiumEditorPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Editar coloquio",
  description: "Editor administrativo del módulo de coloquios privados.",
};

export default async function AdminColloquiumEditorPage({
  params,
  searchParams,
}: AdminColloquiumEditorPageProps) {
  await requireAdmin();

  const { id } = await params;
  const [colloquium, books, resolvedSearchParams, mediaBucketName] =
    await Promise.all([
      getAdminColloquiumEditorRecord(id),
      listColloquiumBookOptions(),
      searchParams,
      Promise.resolve(getSupabaseColloquiumMediaBucket()),
    ]);

  if (!colloquium) {
    notFound();
  }

  return (
    <AdminColloquiumEditor
      books={books}
      colloquium={colloquium}
      feedback={getColloquiumEditorFeedbackMessage(resolvedSearchParams)}
      mediaBucketName={mediaBucketName}
      mode="edit"
    />
  );
}
