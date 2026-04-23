import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpenText } from "lucide-react";

import { getPublicBooks } from "@/lib/books/data";
import { createWhatsAppHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Library | Cafe Lectura",
  description: "Public library catalog for Cafe Lectura.",
};

function buildBookRequestHref(title: string, author: string) {
  return createWhatsAppHref(
    `Me interesa solicitar el libro "${title}" de ${author}.`,
  );
}

export default async function LibraryPage() {
  const books = await getPublicBooks();

  return (
    <main className="page-shell">
      <div className="page-container">
        <header className="surface-card px-6 py-8 md:px-10 md:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="eyebrow">Biblioteca publica</p>
              <h1 className="mt-4 text-[38px] leading-[1.15] font-semibold text-[var(--color-ink)] md:text-[52px]">
                Libros para descubrir, leer con interes y solicitar con
                facilidad
              </h1>
              <p className="mt-5 max-w-3xl text-[18px] leading-8 text-[var(--color-ink-soft)] md:text-[19px]">
                Esta biblioteca muestra los titulos disponibles en Cafe Lectura.
                Puedes recorrer el catalogo con calma y escribirnos por WhatsApp
                para pedir informacion o solicitar un libro en particular.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-[17px] font-semibold">
              <Link href="/" className="editorial-link">
                Volver al inicio
              </Link>
            </div>
          </div>
        </header>

        {books.length === 0 ? (
          <section className="surface-card px-6 py-8 md:px-10 md:py-10">
            <div className="max-w-2xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-paper-soft)] text-[var(--color-casa)]">
                <BookOpenText className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-[30px] leading-[1.24] font-semibold text-[var(--color-ink)]">
                Biblioteca en preparacion
              </h2>
              <p className="mt-4 text-[18px] leading-8 text-[var(--color-ink-soft)]">
                Todavia no hay libros publicados en el catalogo. En cuanto el
                equipo cargue nuevos titulos desde el panel admin, apareceran
                aqui.
              </p>
            </div>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => (
              <article
                key={book.id}
                className="surface-card flex h-full flex-col overflow-hidden"
              >
                <div className="aspect-[4/5] bg-[var(--color-paper-soft)]">
                  {book.coverImageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={book.coverImageUrl}
                        alt={`Portada de ${book.title}`}
                        className="h-full w-full object-cover"
                      />
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center px-8 text-center text-[17px] font-semibold text-[var(--color-ink-soft)]">
                      Portada no disponible
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <p className="eyebrow">Catalogo disponible</p>
                  <div className="mt-4 space-y-3">
                    <h2 className="text-[28px] leading-[1.24] font-semibold text-[var(--color-ink)]">
                      {book.title}
                    </h2>
                    <p className="text-[17px] font-semibold text-[var(--color-casa)]">
                      {book.author}
                    </p>
                    <p className="text-[17px] leading-8 text-[var(--color-ink-soft)]">
                      {book.synopsis}
                    </p>
                  </div>

                  <div className="mt-6 pt-2">
                    <a
                      href={buildBookRequestHref(book.title, book.author)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary gap-2"
                    >
                      Solicitar por WhatsApp
                      <ArrowUpRight className="h-[18px] w-[18px]" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
