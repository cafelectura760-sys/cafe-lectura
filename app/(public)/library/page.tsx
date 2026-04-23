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
    <PageShell>
      <SiteHeader
        items={[
          { href: "/", label: "Inicio" },
          { href: "/library", label: "Biblioteca" },
          { href: "/login", label: "Iniciar sesion" },
        ]}
        activeHref="/library"
        description="Catalogo publico de libros disponibles para consultar y solicitar por WhatsApp."
        actions={
          <a
            href={createWhatsAppHref(
              "Quiero recibir orientacion sobre un libro disponible en la biblioteca de Cafe Lectura.",
            )}
            target="_blank"
            rel="noreferrer"
            className="btn-warm"
          >
            Consultar por WhatsApp
          </a>
        }
      />

      <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <SectionHeading
          eyebrow="Biblioteca publica"
          title="Libros para descubrir, leer con interes y solicitar con facilidad"
          description="Esta biblioteca muestra los titulos disponibles en Cafe Lectura. Puedes recorrer el catalogo con calma y escribirnos por WhatsApp para pedir informacion o solicitar un libro en particular."
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
              Los titulos se presentan con portada, autor y sinopsis para que la
              consulta sea simple y directa. La solicitud siempre termina en un
              contacto humano por WhatsApp.
            </p>
          </div>
          <StatusBanner title="Sin descargas ni pasos confusos">
            El catalogo es solo de consulta. Si un libro te interesa, la accion
            principal te lleva directamente al canal de contacto del club.
          </StatusBanner>
        </div>
      </section>

      {books.length === 0 ? (
        <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <div className="max-w-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-paper-soft)] text-[var(--color-casa)]">
              <BookOpenText className="h-5 w-5" />
            </div>
            <h2 className="subsection-title mt-5 text-[var(--text-primary)]">
              Biblioteca en preparacion
            </h2>
            <p className="body-large mt-4">
              Todavia no hay libros publicados en el catalogo. En cuanto el
              equipo cargue nuevos titulos desde el panel admin, apareceran
              aqui.
            </p>
          </div>
        </section>
      ) : (
        <section className="content-grid md:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              eyebrow="Catalogo disponible"
              actionHref={buildBookRequestHref(book.title, book.author)}
              actionLabel="Solicitar por WhatsApp"
            />
          ))}
        </section>
      )}
    </PageShell>
  );
}
