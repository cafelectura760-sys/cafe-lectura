import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText } from "lucide-react";

import { BookCard } from "@/components/book-card";
import { PageShell } from "@/components/page-shell";
import { AppHeader } from "@/components/app-header";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
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

          <div className="content-grid mt-8 lg:grid-cols-2">
            <div className="surface-card-muted px-5 py-5 md:px-6">
              <h2 className="text-[22px] font-semibold text-[var(--text-primary)]">
                Una biblioteca para recorrer sin prisa
              </h2>
              <p className="body-copy mt-3">
                Los títulos se presentan con portada, autor y sinopsis para que
                la consulta sea simple, clara y fácil de comparar.
              </p>
            </div>
            <StatusBanner title="Contacto directo y sin pasos confusos">
              Si un libro despierta tu interés, la acción principal te abre un
              canal de conversación directo con el club.
            </StatusBanner>
          </div>
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
            description="Cada ficha mantiene el mismo peso visual para que el recorrido sea claro, estable y fácil de comparar en cualquier tamaño de pantalla."
          />

          <div className="content-grid mt-8 md:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                eyebrow="Catálogo disponible"
                actionHref={buildBookInfoHref(book.title, book.author)}
                actionLabel="Más información"
                compact
              />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
