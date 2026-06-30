import { ArrowUpRight } from "lucide-react";

import type { PublicBook } from "@/lib/books/data";

type BookCardProps = {
  book: PublicBook;
  eyebrow: string;
  actionHref: string;
  actionLabel: string;
  compact?: boolean;
};

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

export function BookCard({
  book,
  eyebrow,
  actionHref,
  actionLabel,
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
        <p
          className={`body-copy flex-1 ${compact ? "book-card-synopsis" : ""}`}
        >
          {compact ? truncateText(book.synopsis, 220) : book.synopsis}
        </p>

        <div className="book-card-footer">
          <p className="meta-copy">Contacto directo con el club</p>
          <a
            href={actionHref}
            target="_blank"
            rel="noreferrer"
            className="btn-primary w-full sm:w-auto"
          >
            {actionLabel}
            <ArrowUpRight className="h-[18px] w-[18px]" />
          </a>
        </div>
      </div>
    </article>
  );
}
