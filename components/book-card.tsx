import { ArrowUpRight } from "lucide-react";

import type { PublicBook } from "@/lib/books/data";
import { cn } from "@/lib/utils";

type BookCardProps = {
  book: PublicBook;
  eyebrow: string;
  actionHref: string;
  actionLabel: string;
  compact?: boolean;
  featured?: boolean;
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
  featured = false,
}: BookCardProps) {
  return (
    <article
      className={cn(
        "book-card surface-card lift-on-hover flex h-full flex-col p-5 md:p-6",
        featured && "book-card-featured",
      )}
    >
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h3
          className={cn(
            "mt-3 text-[var(--text-primary)]",
            featured ? "section-title" : "subsection-title",
          )}
        >
          {book.title}
        </h3>
        <p className="book-card-author">{book.author}</p>
      </div>

      <div className="mt-5">
        <div className={cn("book-cover-frame", featured && "md:aspect-[5/4]")}>
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
        <p className="body-copy flex-1">
          {compact ? truncateText(book.synopsis, 180) : book.synopsis}
        </p>

        <div className="book-card-footer">
          <p className="meta-copy">Solicitud directa por WhatsApp</p>
          <a
            href={actionHref}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "btn-primary w-full sm:w-auto",
              featured && "sm:min-w-[220px]",
            )}
          >
            {actionLabel}
            <ArrowUpRight className="h-[18px] w-[18px]" />
          </a>
        </div>
      </div>
    </article>
  );
}
