import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText } from "lucide-react";

import { BookCard } from "@/components/book-card";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { SiteHeader } from "@/components/site-header";
import { StatusBanner } from "@/components/status-banner";
import { getPublicBooks } from "@/lib/books/data";
import { createWhatsAppHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Biblioteca",
  description: "Catálogo público de libros de Cafe Lectura.",
};

function buildBookRequestHref(title: string, author: string) {
  return createWhatsAppHref(
    `Me interesa solicitar el libro "${title}" de ${author}.`,
  );
}

export default async function LibraryPage() {
  const books = await getPublicBooks();
  const leadBook = books[0];
  const remainingBooks = books.slice(1);
  const guidanceHref = createWhatsAppHref(
    "Quiero recibir orientación sobre un libro disponible en la biblioteca de Cafe Lectura.",
  );

  return (
    <PageShell>
      <SiteHeader
        items={[
          { href: "/", label: "Inicio" },
          { href: "/library", label: "Biblioteca" },
          { href: "/login", label: "Iniciar sesión" },
        ]}
        activeHref="/library"
        description="Catálogo público de libros disponibles para consultar y solicitar por WhatsApp."
        actions={
          <a
            href={guidanceHref}
            target="_blank"
            rel="noreferrer"
            className="btn-warm"
          >
            Consultar por WhatsApp
          </a>
        }
      />

      <section className="hero-band">
        <div className="relative z-10">
          <div className="accent-rule mb-5" />
          <SectionHeading
            eyebrow="Biblioteca pública"
            title="Libros para descubrir, leer con interés y solicitar con facilidad"
            description="Esta biblioteca muestra los títulos disponibles en Cafe Lectura. Puedes recorrer el catálogo con calma y escribirnos por WhatsApp para pedir información o solicitar un libro en particular."
            titleClassName="display-title"
            action={
              <Link href="/" className="editorial-link">
                Volver al inicio
              </Link>
            }
          />

          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="surface-card-muted px-5 py-5 md:px-6">
              <h2 className="text-[22px] font-semibold text-[var(--text-primary)]">
                Una biblioteca para recorrer sin prisa
              </h2>
              <p className="body-copy mt-3">
                Los títulos se presentan con portada, autor y sinopsis para que
                la consulta sea simple y directa. La solicitud siempre termina
                en un contacto humano por WhatsApp.
              </p>
            </div>
            <StatusBanner title="Sin descargas ni pasos confusos">
              El catálogo es solo de consulta. Si un libro te interesa, la
              acción principal te lleva directamente al canal de contacto del
              club.
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
        <div className="grid gap-6">
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_320px]">
            {leadBook ? (
              <BookCard
                book={leadBook}
                eyebrow="Para comenzar el recorrido"
                actionHref={buildBookRequestHref(
                  leadBook.title,
                  leadBook.author,
                )}
                actionLabel="Solicitar por WhatsApp"
                featured
              />
            ) : null}

            <aside className="editorial-note-strong h-fit">
              <p className="eyebrow">Consulta humana</p>
              <h2 className="subsection-title mt-3 text-[var(--text-primary)]">
                Cada solicitud termina en una conversación clara
              </h2>
              <p className="body-copy mt-4">
                El catálogo no intenta parecer una tienda. La portada, el autor
                y la sinopsis te ayudan a elegir; después, el contacto sigue de
                manera directa por WhatsApp.
              </p>
              <div className="mt-6">
                <a
                  href={guidanceHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary w-full"
                >
                  Pedir orientación
                </a>
              </div>
            </aside>
          </section>

          {remainingBooks.length > 0 ? (
            <section className="content-grid md:grid-cols-2 xl:grid-cols-3">
              {remainingBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  eyebrow="Catálogo disponible"
                  actionHref={buildBookRequestHref(book.title, book.author)}
                  actionLabel="Solicitar por WhatsApp"
                />
              ))}
            </section>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}
