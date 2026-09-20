import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { BookCard } from "@/components/book-card";
import { PageShell } from "@/components/page-shell";
import { AnimatedContentSlot } from "@/components/react-bits/animated-content-slot";
import { SectionHeading } from "@/components/section-heading";
import { getAuthSession } from "@/lib/auth/session";
import { getPublicBooks } from "@/lib/books/data";
import { createWhatsAppHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Colección",
  description:
    "Colección pública de obras trabajadas por Café Lectura Barquisimeto.",
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
        description="Colección pública de obras trabajadas por el club."
      />

      <section className="hero-band">
        <AnimatedContentSlot delay={0} distance={20} className="relative z-10">
          <div className="accent-rule mb-5" />
          <SectionHeading
            eyebrow="Colección del club"
            title="Obras para conocer y explorar con calma"
            description="Esta sección reúne algunas de las obras trabajadas en Café Lectura Barquisimeto. Puedes recorrerlas con calma y escribirnos si quieres saber más sobre alguna."
            titleClassName="display-title"
            action={
              <Link href="/" className="editorial-link">
                Volver al inicio
              </Link>
            }
          />
        </AnimatedContentSlot>
      </section>

      {books.length === 0 ? (
        <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <div className="max-w-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-paper-soft)] text-[var(--color-casa)]">
              <BookOpenText className="h-5 w-5" />
            </div>
            <h2 className="subsection-title mt-5 text-[var(--text-primary)]">
              Colección en preparación
            </h2>
            <p className="body-large mt-4">
              Todavía no hay obras publicadas en la colección. En cuanto el
              equipo cargue nuevos contenidos desde el panel de administración,
              aparecerán aquí.
            </p>
          </div>
        </section>
      ) : (
        <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <AnimatedContentSlot delay={0} distance={20}>
            <SectionHeading
              eyebrow="Colección disponible"
              title="Una colección seleccionada por el club"
              description="Cada ficha reúne la información disponible sobre una obra y su relación con los coloquios publicados."
            />
          </AnimatedContentSlot>

          <div className="content-grid mt-8 md:grid-cols-2 xl:grid-cols-3">
            {books.map((book, index) => (
              <AnimatedContentSlot
                key={book.id}
                delay={1 + (index % 6) * 1.5}
                distance={28}
                className="h-full"
              >
                <BookCard
                  book={book}
                  eyebrow="Obra del club"
                  detailHref={buildBookDetailHref(book.id)}
                  inquiryHref={buildBookInfoHref(book.title, book.author)}
                  inquiryLabel="Más información"
                  compact
                />
              </AnimatedContentSlot>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
