import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { PublicBook } from "@/lib/books/data";

type BookCardProps = {
  book: PublicBook;
  eyebrow: string;
  detailHref: string;
  inquiryHref: string;
  inquiryLabel: string;
  compact?: boolean;
};

export function BookCard({
  book,
  eyebrow,
  detailHref,
  inquiryHref,
  inquiryLabel,
  compact = false,
}: BookCardProps) {
  return (
    <article className="book-card surface-card lift-on-hover flex h-full flex-col p-5 md:p-6">
      <div className="book-card-header min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h3
          className="book-card-title subsection-title text-[var(--text-primary)]"
          title={book.title}
        >
          {book.title}
        </h3>
        <p
          className="book-card-author book-card-author-clamp"
          title={book.author}
        >
          {book.author}
        </p>
      </div>

      <div className="mt-5">
        <div className="book-cover-frame">
          {book.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverImageUrl}
              alt={`Portada de ${book.title}`}
              className="book-cover-image"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-[16px] font-semibold text-[var(--text-muted)]">
              Portada no disponible
            </div>
          )}
        </div>
      </div>

      <div className="book-card-copy pt-5">
        {!compact ? <p className="body-copy flex-1">{book.synopsis}</p> : null}

        <div
          className={`book-card-footer ${compact ? "mt-auto border-t-0 pt-0" : ""}`}
        >
          {!compact ? (
            <div className="space-y-2">
              <p className="meta-copy">
                Lectura con contexto y conversación directa
              </p>
            </div>
          ) : null}

          <div
            className={`book-card-actions ${compact ? "w-full sm:w-full sm:justify-between" : ""}`}
          >
            <Link href={detailHref} className="btn-secondary w-full sm:w-auto">
              Ver libro
            </Link>
            <a
              href={inquiryHref}
              target="_blank"
              rel="noreferrer"
              className="editorial-link w-full justify-center sm:w-auto"
            >
              {inquiryLabel}
              <ArrowUpRight className="h-[18px] w-[18px]" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
