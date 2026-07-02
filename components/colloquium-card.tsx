import Link from "next/link";
import { ArrowRight, BookOpenText, CalendarDays } from "lucide-react";

import type { ColloquiumSummary } from "@/lib/colloquiums/types";
import { cn } from "@/lib/utils";

type ColloquiumCardProps = {
  colloquium: ColloquiumSummary;
  featured?: boolean;
};

function formatDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "long",
  }).format(new Date(isoDate));
}

export function ColloquiumCard({
  colloquium,
  featured = false,
}: ColloquiumCardProps) {
  return (
    <article
      className={cn(
        "colloquium-card surface-card lift-on-hover overflow-hidden p-5 md:p-6",
        featured && "colloquium-card-featured",
      )}
    >
      <div
        className={cn(
          "grid gap-6",
          featured
            ? "xl:grid-cols-[188px_minmax(0,1fr)]"
            : "lg:grid-cols-[168px_minmax(0,1fr)]",
        )}
      >
        <div
          className={cn(
            "book-cover-frame mx-auto lg:mx-0",
            featured ? "max-w-[188px]" : "max-w-[168px]",
          )}
        >
          {colloquium.bookCoverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={colloquium.bookCoverImageUrl}
              alt={`Portada de ${colloquium.bookTitle}`}
              className="book-cover-image"
            />
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center px-6 text-center text-[16px] font-semibold text-[var(--text-muted)]">
              Portada no disponible
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-5 py-1">
          <div>
            <div className="colloquium-meta">
              <span className="editorial-pill">Área privada</span>
              <span className="editorial-pill">
                <CalendarDays className="h-4 w-4" />
                Publicado el{" "}
                {formatDateLabel(
                  colloquium.publishedAt ?? new Date().toISOString(),
                )}
              </span>
            </div>
            <p className="eyebrow mt-4">{colloquium.bookTitle}</p>
            <h2
              className={cn(
                "mt-3 text-[var(--text-primary)]",
                featured ? "section-title" : "subsection-title",
              )}
            >
              {colloquium.title}
            </h2>
            <p className="meta-copy mt-3 inline-flex items-center gap-2">
              <BookOpenText className="h-4 w-4" />
              {colloquium.bookAuthor}
            </p>
            <p className="body-copy mt-4">
              {colloquium.excerpt ??
                "Este coloquio ya está disponible para lectura privada."}
            </p>
          </div>

          <div className="colloquium-card-footer">
            <p className="meta-copy">
              Lectura privada preparada para miembros activos.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={`/colloquiums/${colloquium.slug}`}
                className="btn-primary"
              >
                Abrir coloquio
                <ArrowRight className="h-[18px] w-[18px]" />
              </Link>
              <Link href="/library" className="btn-secondary">
                Ver biblioteca
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
