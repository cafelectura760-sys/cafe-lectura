import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ColloquiumReader } from "@/components/colloquiums/colloquium-reader";
import { PageShell } from "@/components/page-shell";
import { logoutAction } from "@/lib/auth/actions";
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
    "Vista detallada de un coloquio privado para miembros de Cafe Lectura.",
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
    <PageShell width="reading">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <Link href="/colloquiums" className="editorial-link">
            Volver a coloquios
          </Link>
          <Link href="/library" className="editorial-link">
            Biblioteca
          </Link>
          <Link href="/" className="editorial-link">
            Inicio
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <p className="meta-copy">
            Leyendo como{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {session.profile.full_name}
            </span>
          </p>
          <form action={logoutAction}>
            <button type="submit" className="btn-ghost">
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <ColloquiumReader colloquium={colloquium} />
    </PageShell>
  );
}
