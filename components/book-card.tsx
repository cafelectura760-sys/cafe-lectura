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
    <article className="surface-card lift-on-hover flex h-full flex-col p-4 md:p-5">
      <div className="book-cover-frame">
        {book.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.coverImageUrl}
            alt={`Portada de ${book.title}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-[16px] font-semibold text-[var(--text-muted)]">
            Portada no disponible
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pt-5 pb-2">
        <p className="eyebrow">{eyebrow}</p>
        <h3 className="subsection-title mt-3 text-[var(--text-primary)]">
          {book.title}
        </h3>
        <p className="mt-2 text-[17px] font-semibold text-[var(--color-casa)]">
          {book.author}
        </p>
        <p className="body-copy mt-4 flex-1">
          {compact ? truncateText(book.synopsis, 180) : book.synopsis}
        </p>
        <div className="mt-6">
          <a
            href={actionHref}
            target="_blank"
            rel="noreferrer"
            className="btn-primary w-full"
          >
            {actionLabel}
            <ArrowUpRight className="h-[18px] w-[18px]" />
          </a>
        </div>
      </div>
    </article>
  );
}
