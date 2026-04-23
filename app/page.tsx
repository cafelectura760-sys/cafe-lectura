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
import { SectionHeading } from "@/components/section-heading";
import { SiteHeader } from "@/components/site-header";
import { StatusBanner } from "@/components/status-banner";
import { logoutAction } from "@/lib/auth/actions";
import { getAuthSession } from "@/lib/auth/session";
import { getPublicBooks } from "@/lib/books/data";
import { createWhatsAppHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Club privado de lectura",
  description:
    "Cafe Lectura es un club privado de lectura con biblioteca publica, membresia anual y coloquios privados para miembros activos.",
};

function getMembershipHref() {
  return createWhatsAppHref(
    "Me gustaria recibir informacion sobre la membresia anual de Cafe Lectura.",
  );
}

function buildBookRequestHref(title: string, author: string) {
  return createWhatsAppHref(
    `Me interesa solicitar el libro "${title}" de ${author}.`,
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
      text: "Consulta los libros disponibles y solicita informacion por WhatsApp sin descargar archivos.",
      icon: Library,
    },
    {
      title: "Membresia anual",
      text: "La participacion se gestiona de forma manual, cercana y sin pagos dentro de la plataforma.",
      icon: MessageCircleMore,
    },
    {
      title: "Coloquios privados",
      text: "Los miembros activos acceden a lecturas y conversaciones preparadas para leer con calma.",
      icon: ScrollText,
    },
  ];

  return (
    <PageShell>
      <SiteHeader
        items={[
          { href: "/", label: "Inicio" },
          { href: "/library", label: "Biblioteca" },
          {
            href: session ? "/colloquiums" : "/login",
            label: session ? "Coloquios" : "Iniciar sesion",
          },
        ]}
        activeHref="/"
        description="Club privado de lectura, biblioteca visible y coloquios para miembros activos."
        actions={
          session ? (
            <>
              <StatusBanner title="Acceso disponible">
                Estas conectado como{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {session.profile?.full_name ?? session.email}
                </span>
                .
              </StatusBanner>
              <div className="flex flex-wrap gap-3">
                <Link href="/colloquiums" className="btn-primary">
                  Ir a coloquios
                </Link>
                {session.profile?.role === "admin" ? (
                  <Link href="/admin" className="btn-secondary">
                    Panel admin
                  </Link>
                ) : null}
                <form action={logoutAction}>
                  <button type="submit" className="btn-ghost">
                    Cerrar sesion
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="btn-secondary">
                Iniciar sesion
              </Link>
              <a
                href={getMembershipHref()}
                target="_blank"
                rel="noreferrer"
                className="btn-warm"
              >
                Consultar membresia
              </a>
            </div>
          )
        }
      />

      <section className="surface-card overflow-hidden px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:gap-10">
          <div className="py-2">
            <p className="eyebrow">Club privado de lectura</p>
            <h1 className="display-title mt-4 max-w-4xl text-[var(--text-primary)]">
              Un lugar sereno para volver a los libros, conversar con calma y
              sostener el habito de leer.
            </h1>
            <p className="body-large mt-6 max-w-3xl">
              Cafe Lectura acompana a sus miembros con una biblioteca publica
              para consulta, una membresia anual gestionada de forma cercana y
              coloquios privados preparados para leer sin prisa.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={getMembershipHref()}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                Consultar membresia
                <ArrowRight className="h-[18px] w-[18px]" />
              </a>
              <Link href="/library" className="btn-secondary">
                Ver biblioteca
              </Link>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="surface-card-muted h-full px-5 py-5"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-default)] text-[var(--color-casa)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-[22px] leading-[1.28] font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </h2>
                    <p className="body-copy mt-3">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="surface-card-muted flex flex-col justify-between px-6 py-6 md:px-7 md:py-7">
            <div>
              <p className="eyebrow">Experiencia del club</p>
              <h2 className="section-title mt-3 text-[var(--text-primary)]">
                Una presencia sobria, cercana y pensada para leer sin apuro
              </h2>
              <p className="body-copy mt-4">
                Cada pantalla busca orientar con claridad: una sola accion
                principal por bloque, textos amplios y una composicion comoda
                para consultar desde el telefono o desde una pantalla de
                escritorio.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="status-panel status-panel-default">
                <p className="text-[16px] font-semibold text-[var(--text-primary)]">
                  Biblioteca publica
                </p>
                <p className="mt-2 text-[16px] leading-7 text-[var(--text-secondary)]">
                  Consulta titulos disponibles y solicita informacion sin
                  descargar archivos.
                </p>
              </div>
              <div className="status-panel status-panel-default">
                <p className="text-[16px] font-semibold text-[var(--text-primary)]">
                  Coloquios privados
                </p>
                <p className="mt-2 text-[16px] leading-7 text-[var(--text-secondary)]">
                  Lecturas y conversaciones reservadas para miembros con acceso
                  activo.
                </p>
              </div>
              <div className="status-panel status-panel-default">
                <p className="text-[16px] font-semibold text-[var(--text-primary)]">
                  Gestion cercana
                </p>
                <p className="mt-2 text-[16px] leading-7 text-[var(--text-secondary)]">
                  La membresia y las solicitudes se coordinan de forma manual
                  por WhatsApp.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <SectionHeading
          eyebrow="Biblioteca"
          title="Una biblioteca visible para descubrir con calma"
          description="Estos son algunos de los titulos disponibles en Cafe Lectura. La consulta y las solicitudes se realizan de manera directa por WhatsApp."
          action={
            <Link href="/library" className="editorial-link">
              Ver catalogo completo
            </Link>
          }
        />

        {featuredBooks.length === 0 ? (
          <div className="mt-8">
            <StatusBanner title="Biblioteca en preparacion">
              La biblioteca publica esta en preparacion. Pronto veras aqui los
              primeros titulos disponibles.
            </StatusBanner>
          </div>
        ) : (
          <div className="content-grid mt-8 md:grid-cols-2 xl:grid-cols-3">
            {featuredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                eyebrow="Selecciones recientes"
                actionHref={buildBookRequestHref(book.title, book.author)}
                actionLabel="Solicitar por WhatsApp"
                compact
              />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <SectionHeading
            eyebrow="Membresia"
            title="Una forma sencilla de sostener el habito de leer durante todo el ano"
            description="Cafe Lectura no funciona como una plataforma de suscripcion automatizada. La membresia es anual, cercana y pensada para acompanar con claridad, sin pasos innecesarios."
          />

          <div className="content-grid mt-8 md:grid-cols-3">
            <article className="surface-card-muted px-5 py-5">
              <h3 className="text-[20px] font-semibold text-[var(--text-primary)]">
                Consulta inicial
              </h3>
              <p className="body-copy mt-3">
                El primer contacto se hace por WhatsApp para resolver dudas y
                explicar como funciona el club.
              </p>
            </article>
            <article className="surface-card-muted px-5 py-5">
              <h3 className="text-[20px] font-semibold text-[var(--text-primary)]">
                Acceso privado
              </h3>
              <p className="body-copy mt-3">
                Los miembros activos encuentran sus coloquios en un espacio
                discreto, legible y facil de recorrer.
              </p>
            </article>
            <article className="surface-card-muted px-5 py-5">
              <h3 className="text-[20px] font-semibold text-[var(--text-primary)]">
                Renovacion manual
              </h3>
              <p className="body-copy mt-3">
                Cuando hace falta renovar, el flujo vuelve a WhatsApp para
                mantener el trato cercano del club.
              </p>
            </article>
          </div>
        </article>

        <aside className="surface-card-strong px-6 py-7 md:px-7 md:py-8">
          <p className="eyebrow text-[color:color-mix(in_srgb,var(--color-paper-soft)_80%,white)]">
            Conversacion cercana
          </p>
          <h2 className="section-title mt-3 text-[var(--text-on-dark)]">
            Quieres saber si Cafe Lectura puede ser para ti?
          </h2>
          <p className="mt-4 text-[18px] leading-8 text-[color:color-mix(in_srgb,var(--color-paper)_84%,white)]">
            Escribenos por WhatsApp y te contamos como funciona la membresia,
            que libros estan disponibles y de que forma se organizan los
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
