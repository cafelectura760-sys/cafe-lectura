import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  MessageCircleMore,
  ScrollText,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { PageShell } from "@/components/page-shell";
import { AnimatedContentSlot } from "@/components/react-bits/animated-content-slot";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getAuthSession } from "@/lib/auth/session";
import { getPublicBookById } from "@/lib/books/data";
import { createWhatsAppHref } from "@/lib/whatsapp";

type LibraryBookDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getMembershipHref() {
  return createWhatsAppHref(
    "Me gustaría recibir información sobre la membresía anual de Café Lectura.",
  );
}

function buildBookInfoHref(title: string, author: string) {
  return createWhatsAppHref(
    `Quiero más información sobre "${title}" de ${author}.`,
  );
}

function renderSynopsis(content: string) {
  return content
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p
        key={`${paragraph.slice(0, 12)}-${index}`}
        className="body-copy text-[var(--text-primary)]"
      >
        {paragraph}
      </p>
    ));
}

export async function generateMetadata({
  params,
}: LibraryBookDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getPublicBookById(id);

  if (!book) {
    return {
      title: "Libro no encontrado",
      description: "No encontramos este libro dentro de la biblioteca pública.",
    };
  }

  return {
    title: `${book.title} | Biblioteca`,
    description: `Ficha pública de ${book.title} de ${book.author} en Café Lectura.`,
  };
}

export default async function LibraryBookDetailPage({
  params,
}: LibraryBookDetailPageProps) {
  const [session, resolvedParams] = await Promise.all([
    getAuthSession(),
    params,
  ]);
  const book = await getPublicBookById(resolvedParams.id);

  if (!book) {
    notFound();
  }

  const inquiryHref = buildBookInfoHref(book.title, book.author);
  const membershipHref = getMembershipHref();
  const linkedColloquiumLabel =
    book.publishedColloquiumCount === 1
      ? "1 coloquio privado del club"
      : `${book.publishedColloquiumCount} coloquios privados del club`;

  return (
    <PageShell>
      <AppHeader
        activeHref="/library"
        session={session}
        description="Ficha pública de un libro disponible para explorar con calma."
      />

      <section className="hero-band">
        <AnimatedContentSlot
          delay={0}
          distance={20}
          className="relative z-10 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center"
        >
          <div className="book-cover-frame max-w-[220px]">
            {book.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.coverImageUrl}
                alt={`Portada de ${book.title}`}
                className="book-cover-image"
              />
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center p-6 text-center text-[16px] font-semibold text-[var(--text-muted)]">
                Portada no disponible
              </div>
            )}
          </div>

          <div className="min-w-0 py-2">
            <div className="colloquium-meta">
              <span className="editorial-pill">
                <BookOpenText className="h-4 w-4" />
                Biblioteca pública
              </span>
              <span className="editorial-pill">
                <ScrollText className="h-4 w-4" />
                Sinopsis completa
              </span>
              <span className="editorial-pill">
                <MessageCircleMore className="h-4 w-4" />
                {book.publishedColloquiumCount > 0
                  ? linkedColloquiumLabel
                  : "Disponible para consulta"}
              </span>
            </div>

            <p className="eyebrow mt-5">Detalle del libro</p>
            <h1 className="display-title mt-4 max-w-4xl text-[var(--text-primary)]">
              {book.title}
            </h1>
            <p className="body-large mt-4">
              de{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {book.author}
              </span>
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={inquiryHref}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                Consultar por este libro
                <ArrowRight className="h-[18px] w-[18px]" />
              </a>
              {session ? (
                <Link href="/colloquiums" className="btn-secondary">
                  Ir a los coloquios
                </Link>
              ) : (
                <a
                  href={membershipHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  Consultar membresía
                </a>
              )}
            </div>
          </div>
        </AnimatedContentSlot>
      </section>

      <div className="flex flex-col gap-6">
        <article className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <AnimatedContentSlot delay={1} distance={24}>
            <SectionHeading
              eyebrow="Sinopsis completa"
              title={`Sobre ${book.title}`}
            />

            <div className="reader-prose mx-0 mt-8 max-w-none">
              {renderSynopsis(book.synopsis)}
            </div>
          </AnimatedContentSlot>
        </article>

        <aside className="editorial-note-strong px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <AnimatedContentSlot delay={2} distance={24}>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-6">
                <div>
                  <p className="eyebrow">Siguiente paso</p>
                  <h2 className="subsection-title mt-3 text-[var(--text-primary)]">
                    Si este libro te despierta curiosidad, ya tienes por dónde
                    entrar
                  </h2>
                  <p className="body-copy mt-4">
                    {session
                      ? "Puedes consultarnos por este título, entrar directamente a tu área privada de coloquios o volver al catálogo para seguir explorando lecturas con tranquilidad."
                      : "Puedes consultarnos por este título, preguntar por la membresía anual o volver al catálogo para seguir comparando lecturas con tranquilidad."}
                  </p>
                </div>

                <StatusBanner
                  title={
                    book.publishedColloquiumCount > 0
                      ? "Libro ya presente en la conversación del club"
                      : "Libro disponible para consulta directa"
                  }
                >
                  {book.publishedColloquiumCount > 0
                    ? `Este título ya forma parte de ${linkedColloquiumLabel}. El acceso a esos coloquios sigue siendo privado para miembros activos.`
                    : "Todavía no aparece vinculado a un coloquio publicado, pero puedes consultarnos por él con total calma."}
                </StatusBanner>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:self-center">
                <a
                  href={inquiryHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary justify-center text-center"
                >
                  Consultar por este libro
                  <ArrowRight className="h-[18px] w-[18px]" />
                </a>
                <Link
                  href="/library"
                  className="btn-secondary justify-center text-center"
                >
                  Volver a la biblioteca
                </Link>
                {session ? (
                  <Link
                    href="/colloquiums"
                    className="editorial-link justify-center pt-1 text-center"
                  >
                    Ir a los coloquios
                  </Link>
                ) : null}
              </div>
            </div>
          </AnimatedContentSlot>
        </aside>
      </div>
    </PageShell>
  );
}
