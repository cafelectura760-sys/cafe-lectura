import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ColloquiumReader } from "@/components/colloquiums/colloquium-reader";
import { PageShell } from "@/components/page-shell";
import { getAdminColloquiumEditorRecord } from "@/lib/colloquiums/data";
import { requireAdmin } from "@/lib/auth/session";

type AdminColloquiumPreviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Previsualizar coloquio",
  description: "Vista previa administrativa de un coloquio privado.",
};

export default async function AdminColloquiumPreviewPage({
  params,
}: AdminColloquiumPreviewPageProps) {
  await requireAdmin();

  const { id } = await params;
  const colloquium = await getAdminColloquiumEditorRecord(id);

  if (!colloquium) {
    notFound();
  }

  return (
    <PageShell width="reading" footer="none">
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/admin/colloquiums/${colloquium.id}`}
          className="btn-secondary"
        >
          Volver al editor
        </Link>
        <Link href="/admin" className="btn-secondary">
          Volver al panel
        </Link>
      </div>

      <ColloquiumReader
        colloquium={colloquium}
        previewLabel="Previsualización administrativa. Este contenido puede incluir bloques de presentación en borrador y no está expuesto a miembros ordinarios."
      />
    </PageShell>
  );
}
