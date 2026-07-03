import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ColloquiumDetailPageShell } from "@/components/colloquiums/colloquium-detail-page-shell";
import { requireActiveMembership } from "@/lib/auth/session";
import { getColloquiumBySegment } from "@/lib/colloquiums/data";

type ColloquiumDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Detalle del coloquio",
  description:
    "Vista detallada de un coloquio privado para miembros de Café Lectura.",
};

export default async function ColloquiumDetailPage({
  params,
}: ColloquiumDetailPageProps) {
  const session = await requireActiveMembership();
  const { id } = await params;
  const colloquium = await getColloquiumBySegment(id);

  if (!colloquium) {
    notFound();
  }

  if (id !== colloquium.slug) {
    redirect(`/colloquiums/${colloquium.slug}`);
  }

  return (
    <ColloquiumDetailPageShell colloquium={colloquium} session={session} />
  );
}
