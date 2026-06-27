import Link from "next/link";

import type { ColloquiumSummary } from "@/lib/colloquiums/types";

type ColloquiumCardProps = {
  colloquium: ColloquiumSummary;
};

function formatDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "long",
  }).format(new Date(isoDate));
}

export function ColloquiumCard({ colloquium }: ColloquiumCardProps) {
  return (
    <article className="surface-card lift-on-hover overflow-hidden p-4 md:p-5">
      <div className="grid gap-6 lg:grid-cols-[168px_minmax(0,1fr)]">
        <div className="book-cover-frame max-w-[168px]">
          {colloquium.bookCoverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={colloquium.bookCoverImageUrl}
              alt={`Portada de ${colloquium.bookTitle}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center px-6 text-center text-[16px] font-semibold text-[var(--text-muted)]">
              Portada no disponible
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-5 py-2">
          <div>
            <p className="eyebrow">{colloquium.bookTitle}</p>
            <h2 className="subsection-title mt-3 text-[var(--text-primary)]">
              {colloquium.title}
            </h2>
            <p className="meta-copy mt-3">
              {colloquium.bookAuthor} - Publicado el{" "}
              {formatDateLabel(
                colloquium.publishedAt ?? new Date().toISOString(),
              )}
            </p>
            <p className="body-copy mt-4">
              {colloquium.excerpt ??
                "Este coloquio ya está disponible para lectura privada."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/colloquiums/${colloquium.slug}`}
              className="btn-primary"
            >
              Abrir coloquio
            </Link>
            <Link href="/library" className="btn-ghost">
              Ver biblioteca
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
