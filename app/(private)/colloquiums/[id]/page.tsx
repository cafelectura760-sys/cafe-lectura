import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageShell } from "@/components/page-shell";
import { logoutAction } from "@/lib/auth/actions";
import { requireActiveMembership } from "@/lib/auth/session";
import { getColloquiumById } from "@/lib/colloquiums/data";
import { renderSafeMarkdown } from "@/lib/markdown/render-markdown";

type ColloquiumDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Detalle del coloquio",
  description:
    "Vista detallada de un coloquio privado para miembros de Cafe Lectura.",
};

function formatDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

export default async function ColloquiumDetailPage({
  params,
}: ColloquiumDetailPageProps) {
  const session = await requireActiveMembership();
  const { id } = await params;
  const colloquium = await getColloquiumById(id);

  if (!colloquium) {
    notFound();
  }

  return (
    <PageShell width="reading">
      <header className="hero-band">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
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
            <div>
              <div className="accent-rule mb-5" />
              <p className="eyebrow">Coloquio privado</p>
              <h1 className="display-title mt-4 max-w-4xl text-[var(--text-primary)]">
                {colloquium.title}
              </h1>
              <p className="body-large mt-4 max-w-3xl">
                Basado en{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {colloquium.bookTitle}
                </span>{" "}
                de {colloquium.bookAuthor}. Publicado el{" "}
                {formatDateLabel(colloquium.publishedAt)}.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="status-panel status-panel-default max-w-[320px]">
              <p className="text-[16px] font-semibold text-[var(--text-primary)]">
                Acceso de miembro
              </p>
              <p className="mt-2 text-[16px] leading-7 text-[var(--text-secondary)]">
                Estás leyendo como{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {session.profile.full_name}
                </span>
                .
              </p>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="btn-ghost">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="reader-panel">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
          <div className="book-cover-frame max-w-[220px]">
            {colloquium.bookCoverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={colloquium.bookCoverImageUrl}
                alt={`Portada de ${colloquium.bookTitle}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center p-6 text-center text-[16px] font-semibold text-[var(--text-muted)]">
                Portada no disponible
              </div>
            )}
          </div>

          <div className="max-w-2xl py-2">
            <p className="eyebrow">Libro relacionado</p>
            <h2 className="section-title mt-3 text-[var(--text-primary)]">
              {colloquium.bookTitle}
            </h2>
            <p className="body-copy mt-3">{colloquium.bookAuthor}</p>
            <p className="body-copy mt-5">
              Esta lectura se presenta en un formato continuo para favorecer la
              concentración. Los tramos de moderación y participación se
              distinguen con un énfasis visual suave, sin romper el ritmo de
              lectura.
            </p>
          </div>
        </div>
      </section>

      <article className="reader-prose">
        {renderSafeMarkdown(colloquium.content)}
      </article>
    </PageShell>
  );
}
