import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ColloquiumReader } from "@/components/colloquiums/colloquium-reader";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/admin/colloquiums/${colloquium.id}/preview/fullscreen`}>
            Ver vista completa
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/admin/colloquiums/${colloquium.id}`}>
            Volver al editor
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/colloquiums">Volver a coloquios</Link>
        </Button>
      </div>

      <ColloquiumReader
        colloquium={colloquium}
        previewLabel="Previsualización administrativa. Este contenido puede incluir bloques de presentación en borrador y no está expuesto a miembros ordinarios."
      />
    </div>
  );
}
