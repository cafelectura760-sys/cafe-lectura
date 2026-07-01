import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Library,
  MessageCircleMore,
  ScrollText,
} from "lucide-react";

import { BookCard } from "@/components/book-card";
import { PageShell } from "@/components/page-shell";
import { AppHeader } from "@/components/app-header";
import { ReadingTableau } from "@/components/reading-tableau";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getAuthSession } from "@/lib/auth/session";
import { getPublicBooks } from "@/lib/books/data";
import { createWhatsAppHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Club privado de lectura",
  description:
    "Cafe Lectura es un club privado de lectura con biblioteca pública, membresía anual y coloquios privados para miembros activos.",
};

function getMembershipHref() {
  return createWhatsAppHref(
    "Me gustaría recibir información sobre la membresía anual de Cafe Lectura.",
  );
}

function buildBookInfoHref(title: string, author: string) {
  return createWhatsAppHref(
    `Quiero más información sobre "${title}" de ${author}.`,
  );
}

export default async function Home() {
  const [session, books] = await Promise.all([
    getAuthSession(),
    getPublicBooks(),
  ]);
  const featuredBooks = books.slice(0, 3);
  const highlights = [
    {
      title: "Biblioteca visible",
      text: "Consulta los libros disponibles y descubre nuevas lecturas con una guía clara y directa.",
      icon: Library,
    },
    {
      title: "Membresía anual",
      text: "La participación se gestiona de forma manual, cercana y sin pagos dentro de la plataforma.",
      icon: MessageCircleMore,
    },
    {
      title: "Coloquios privados",
      text: "Los miembros activos acceden a lecturas y conversaciones preparadas para leer con calma.",
      icon: ScrollText,
    },
  ];
  const membershipSteps = [
    {
      number: "01",
      title: "Consulta inicial",
      text: "El primer contacto se hace por WhatsApp para resolver dudas y explicar cómo funciona el club.",
    },
    {
      number: "02",
      title: "Acceso privado",
      text: "Los miembros activos encuentran sus coloquios en un espacio discreto, legible y fácil de recorrer.",
    },
    {
      number: "03",
      title: "Renovación manual",
      text: "Cuando hace falta renovar, el flujo vuelve a WhatsApp para mantener el trato cercano del club.",
    },
  ];

  return (
    <PageShell>
      <AppHeader
        activeHref="/"
        session={session}
        description="Club privado de lectura, biblioteca visible y coloquios para miembros activos."
      />

      <section className="hero-band">
        <div className="relative z-10 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.9fr)] lg:items-center lg:gap-10">
          <div className="reveal-soft min-w-0 py-2">
            <div className="accent-rule" />
            <p className="eyebrow mt-5">Club privado de lectura</p>
            <h1 className="display-title mt-4 max-w-4xl text-[var(--text-primary)]">
              Un club de lectura que se siente cercano desde la primera visita.
            </h1>
            <p className="body-large mt-6 max-w-3xl">
              Cafe Lectura acompaña a sus miembros con una biblioteca pública
              para consulta, una membresía anual gestionada de forma cercana y
              coloquios privados preparados para leer sin prisa.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={getMembershipHref()}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                Consultar membresía
                <ArrowRight className="h-[18px] w-[18px]" />
              </a>
              <Link href="/library" className="btn-secondary">
                Ver biblioteca
              </Link>
            </div>

            <div className="content-grid mt-10 md:grid-cols-2 2xl:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="editorial-note lift-on-hover h-full"
                  >
                    <div className="flex h-full flex-col gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[var(--surface-default)] text-[var(--color-casa)] shadow-[0_10px_22px_rgba(31,26,23,0.06)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-[22px] leading-[1.24] font-semibold text-[var(--text-primary)]">
                          {item.title}
                        </h2>
                        <p className="body-copy mt-2">{item.text}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <ReadingTableau />
        </div>
      </section>

      <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <SectionHeading
          eyebrow="Biblioteca"
          title="Una biblioteca visible para descubrir con calma"
          description="Estos son algunos de los títulos disponibles en Cafe Lectura. Puedes recorrerlos con calma y escribirnos si quieres conocer más sobre alguno de ellos."
          action={
            <Link href="/library" className="editorial-link">
              Ver catálogo completo
            </Link>
          }
        />

        {featuredBooks.length === 0 ? (
          <div className="mt-8">
            <StatusBanner title="Biblioteca en preparación">
              La biblioteca pública está en preparación. Pronto verás aquí los
              primeros títulos disponibles.
            </StatusBanner>
          </div>
        ) : (
          <div className="content-grid mt-8 md:grid-cols-2 xl:grid-cols-3">
            {featuredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                eyebrow="Selección del club"
                actionHref={buildBookInfoHref(book.title, book.author)}
                actionLabel="Más información"
                compact
              />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <SectionHeading
            eyebrow="Membresía"
            title="Una forma sencilla de sostener el hábito de leer durante todo el año"
            description="Cafe Lectura no funciona como una plataforma de suscripción automatizada. La membresía es anual, cercana y pensada para acompañar con claridad, sin pasos innecesarios."
          />

          <div className="content-grid mt-8 md:grid-cols-3">
            {membershipSteps.map((step) => (
              <article key={step.number} className="editorial-step h-full">
                <div className="flex items-center gap-3">
                  <span className="editorial-step-number">{step.number}</span>
                  <h3 className="text-[20px] font-semibold text-[var(--text-primary)]">
                    {step.title}
                  </h3>
                </div>
                <p className="body-copy mt-4">{step.text}</p>
              </article>
            ))}
          </div>
        </article>

        <aside className="surface-card-strong px-6 py-7 md:px-7 md:py-8">
          <p className="eyebrow text-[color:color-mix(in_srgb,var(--color-paper-soft)_80%,white)]">
            Conversación cercana
          </p>
          <div className="accent-rule mt-4" />
          <h2 className="section-title mt-3 text-[var(--text-on-dark)]">
            ¿Quieres saber si Cafe Lectura puede ser para ti?
          </h2>
          <p className="mt-4 text-[18px] leading-8 text-[color:color-mix(in_srgb,var(--color-paper)_84%,white)]">
            Escríbenos por WhatsApp y te contamos cómo funciona la membresía,
            qué libros están disponibles y de qué forma se organizan los
            coloquios del club.
          </p>
          <div className="mt-8">
            <a
              href={getMembershipHref()}
              target="_blank"
              rel="noreferrer"
              className="btn-warm"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
