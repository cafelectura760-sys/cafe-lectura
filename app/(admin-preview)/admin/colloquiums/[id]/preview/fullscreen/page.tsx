import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ColloquiumDetailPageShell } from "@/components/colloquiums/colloquium-detail-page-shell";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminColloquiumEditorRecord } from "@/lib/colloquiums/data";

type AdminColloquiumFullscreenPreviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Vista completa del coloquio",
  description:
    "Vista completa de la previsualización administrativa de un coloquio privado.",
};

export default async function AdminColloquiumFullscreenPreviewPage({
  params,
}: AdminColloquiumFullscreenPreviewPageProps) {
  const session = await requireAdmin();

  const { id } = await params;
  const colloquium = await getAdminColloquiumEditorRecord(id);

  if (!colloquium) {
    notFound();
  }

  return (
    <ColloquiumDetailPageShell colloquium={colloquium} session={session} />
  );
}
