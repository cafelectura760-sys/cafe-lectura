import type { Metadata } from "next";
import Link from "next/link";

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
    <main className="flex flex-1 bg-stone-100 px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
            Biblioteca publica
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-900">
            Libros para descubrir y solicitar
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-700">
            Esta biblioteca muestra los libros disponibles en Cafe Lectura.
            Puedes revisar cada titulo y escribirnos por WhatsApp para pedir
            informacion o solicitar uno en particular.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="font-semibold text-stone-900 underline underline-offset-4"
            >
              Volver al inicio
            </Link>
          </div>
        </header>

        {books.length === 0 ? (
          <section className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-stone-900">
              Biblioteca en preparacion
            </h2>
            <p className="mt-4 text-base leading-8 text-stone-700">
              Todavia no hay libros publicados en el catalogo. En cuanto el
              equipo cargue nuevos titulos desde el panel admin, apareceran
              aqui.
            </p>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => (
              <article
                key={book.id}
                className="flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
              >
                <div className="aspect-[4/5] bg-stone-200">
                  {book.coverImageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={book.coverImageUrl}
                        alt={`Portada de ${book.title}`}
                        className="h-full w-full object-cover"
                      />
                    </>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="space-y-3">
                    <h2 className="text-2xl font-semibold text-stone-900">
                      {book.title}
                    </h2>
                    <p className="text-base font-medium text-stone-700">
                      {book.author}
                    </p>
                    <p className="text-base leading-8 text-stone-700">
                      {book.synopsis}
                    </p>
                  </div>

                  <div className="mt-6">
                    <a
                      href={buildBookRequestHref(book.title, book.author)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-12 items-center justify-center rounded-md bg-stone-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-stone-800"
                    >
                      Solicitar por WhatsApp
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
