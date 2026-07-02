import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { BookCard } from "@/components/book-card";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { getAuthSession } from "@/lib/auth/session";
import { getPublicBooks } from "@/lib/books/data";
import { createWhatsAppHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Biblioteca",
  description: "Catálogo público de libros de Cafe Lectura.",
};

function buildBookInfoHref(title: string, author: string) {
  return createWhatsAppHref(
    `Quiero más información sobre "${title}" de ${author}.`,
  );
}

function buildBookDetailHref(bookId: string) {
  return `/library/${bookId}`;
}

export default async function LibraryPage() {
  const [session, books] = await Promise.all([
    getAuthSession(),
    getPublicBooks(),
  ]);

  return (
    <PageShell>
      <AppHeader
        activeHref="/library"
        session={session}
        description="Catálogo público de libros disponibles para explorar con calma."
      />

      <section className="hero-band">
        <div className="relative z-10">
          <div className="accent-rule mb-5" />
          <SectionHeading
            eyebrow="Biblioteca pública"
            title="Libros para descubrir y conocer con calma"
            description="Esta biblioteca muestra los títulos disponibles en Cafe Lectura. Puedes recorrer el catálogo con calma y escribirnos si quieres saber más sobre algún libro."
            titleClassName="display-title"
            action={
              <Link href="/" className="editorial-link">
                Volver al inicio
              </Link>
            }
          />
        </div>
      </section>

      {books.length === 0 ? (
        <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <div className="max-w-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-paper-soft)] text-[var(--color-casa)]">
              <BookOpenText className="h-5 w-5" />
            </div>
            <h2 className="subsection-title mt-5 text-[var(--text-primary)]">
              Biblioteca en preparación
            </h2>
            <p className="body-large mt-4">
              Todavía no hay libros publicados en el catálogo. En cuanto el
              equipo cargue nuevos títulos desde el panel de administración,
              aparecerán aquí.
            </p>
          </div>
        </section>
      ) : (
        <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <SectionHeading
            eyebrow="Catálogo disponible"
            title="Una biblioteca visible para explorar con calma"
            description="Cada tarjeta conserva una lectura más limpia y deja la sinopsis completa para la ficha del libro, con un recorrido más claro en cualquier tamaño de pantalla."
          />

          <div className="content-grid mt-8 md:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                eyebrow="Catálogo disponible"
                detailHref={buildBookDetailHref(book.id)}
                inquiryHref={buildBookInfoHref(book.title, book.author)}
                inquiryLabel="Más información"
                compact
              />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
