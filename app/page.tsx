import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  LibraryBig,
  MessageCircleMore,
} from "lucide-react";

import { logoutAction } from "@/lib/auth/actions";
import { getAuthSession } from "@/lib/auth/session";
import { getPublicBooks } from "@/lib/books/data";
import { createWhatsAppHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Cafe Lectura | Club privado de lectura",
  description:
    "Cafe Lectura es un club privado de lectura con biblioteca publica, membresia anual y coloquios privados para miembros activos.",
};

function getMembershipHref() {
  return createWhatsAppHref(
    "Me gustaria recibir informacion sobre la membresia anual de Cafe Lectura.",
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
      icon: LibraryBig,
    },
    {
      title: "Membresia anual",
      text: "La participacion se gestiona de forma manual, cercana y sin pagos dentro de la plataforma.",
      icon: MessageCircleMore,
    },
    {
      title: "Coloquios privados",
      text: "Los miembros activos acceden a lecturas y conversaciones preparadas para leer con calma.",
      icon: BookOpenText,
    },
  ];

  return (
    <main className="page-shell">
      <div className="page-container">
        <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="eyebrow">Cafe Lectura</p>
            <p className="max-w-xl text-[17px] leading-7 text-[var(--color-ink-soft)] md:text-[18px]">
              Club privado de lectura, biblioteca visible y coloquios para
              miembros activos.
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-[17px] font-semibold text-[var(--color-ink)]">
            <Link href="/" className="editorial-link">
              Inicio
            </Link>
            <Link href="/library" className="editorial-link">
              Biblioteca
            </Link>
            {session ? (
              <Link href="/colloquiums" className="editorial-link">
                Coloquios
              </Link>
            ) : (
              <Link href="/login" className="editorial-link">
                Iniciar sesion
              </Link>
            )}
          </nav>
        </header>

        <section className="surface-card overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="bg-[var(--color-surface)] px-6 py-8 md:px-10 md:py-12 lg:px-12 lg:py-16">
              <p className="eyebrow">Club privado de lectura</p>
              <h1 className="mt-4 max-w-4xl text-[38px] leading-[1.15] font-semibold text-[var(--color-ink)] md:text-[52px]">
                Un lugar sereno para volver a los libros, conversar con calma y
                sostener el habito de leer.
              </h1>
              <p className="mt-6 max-w-3xl text-[18px] leading-8 text-[var(--color-ink-soft)] md:text-[19px]">
                Cafe Lectura acompana a sus miembros con una biblioteca publica
                para consulta, una membresia anual gestionada de forma cercana y
                coloquios privados preparados para leer sin prisa.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={getMembershipHref()}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary gap-2"
                >
                  Consultar membresia
                  <ArrowRight className="h-[18px] w-[18px]" />
                </a>
                <Link href="/library" className="btn-secondary">
                  Ver biblioteca
                </Link>
              </div>
            </div>

            <aside className="flex flex-col justify-between border-t border-[var(--color-line)] bg-[var(--color-paper-soft)] px-6 py-8 md:px-10 md:py-10 lg:border-t-0 lg:border-l lg:px-10 lg:py-12">
              <div>
                <p className="eyebrow">Acceso para miembros</p>
                <h2 className="mt-4 text-[30px] leading-[1.24] font-semibold text-[var(--color-ink)]">
                  Tu espacio privado de lectura
                </h2>
                <p className="mt-4 text-[18px] leading-8 text-[var(--color-ink-soft)]">
                  Si ya eres miembro, aqui puedes entrar al area privada donde
                  se publican los coloquios y lecturas del club.
                </p>
              </div>

              {session ? (
                <div className="mt-8 space-y-4">
                  <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-[17px] leading-7 text-[var(--color-ink-soft)]">
                    Estas conectado como{" "}
                    <span className="font-semibold text-[var(--color-ink)]">
                      {session.profile?.full_name ?? session.email}
                    </span>
                    .
                  </div>
                  <div className="flex flex-col gap-3">
                    <Link href="/colloquiums" className="btn-primary">
                      Ir a coloquios
                    </Link>
                    {session.profile?.role === "admin" ? (
                      <Link href="/admin" className="btn-secondary">
                        Ir al panel admin
                      </Link>
                    ) : null}
                    <form action={logoutAction}>
                      <button type="submit" className="btn-secondary w-full">
                        Cerrar sesion
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="mt-8 flex flex-col gap-3">
                  <Link href="/login" className="btn-secondary">
                    Iniciar sesion
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="surface-card p-6 md:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-paper-soft)] text-[var(--color-casa)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-[28px] leading-[1.24] font-semibold text-[var(--color-ink)]">
                  {item.title}
                </h2>
                <p className="mt-4 text-[18px] leading-8 text-[var(--color-ink-soft)]">
                  {item.text}
                </p>
              </article>
            );
          })}
        </section>

        <section className="surface-card px-6 py-8 md:px-10 md:py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">Biblioteca</p>
              <h2 className="mt-4 text-[32px] leading-[1.2] font-semibold text-[var(--color-ink)] md:text-[40px]">
                Una biblioteca visible para descubrir con calma
              </h2>
              <p className="mt-4 text-[18px] leading-8 text-[var(--color-ink-soft)]">
                Estos son algunos de los titulos ya disponibles en Cafe Lectura.
                La consulta y las solicitudes se realizan de manera directa por
                WhatsApp.
              </p>
            </div>
            <Link href="/library" className="editorial-link">
              Ver catalogo completo
            </Link>
          </div>

          {featuredBooks.length === 0 ? (
            <div className="mt-8 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-6 text-[18px] leading-8 text-[var(--color-ink-soft)]">
              La biblioteca publica esta en preparacion. Pronto veras aqui los
              primeros titulos disponibles.
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featuredBooks.map((book) => (
                <article
                  key={book.id}
                  className="rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-soft)] p-6"
                >
                  <p className="eyebrow">Selecciones recientes</p>
                  <h3 className="mt-4 text-[28px] leading-[1.24] font-semibold text-[var(--color-ink)]">
                    {book.title}
                  </h3>
                  <p className="mt-2 text-[17px] font-semibold text-[var(--color-casa)]">
                    {book.author}
                  </p>
                  <p className="mt-4 line-clamp-4 text-[17px] leading-8 text-[var(--color-ink-soft)]">
                    {book.synopsis}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          className="rounded-lg px-6 py-8 text-[var(--color-surface)] md:px-10 md:py-10"
          style={{
            background:
              "linear-gradient(135deg, var(--color-casa), var(--color-dune))",
          }}
        >
          <div className="max-w-4xl">
            <p className="eyebrow text-[color:color-mix(in_srgb,var(--color-paper-soft)_75%,white)]">
              Conversacion cercana
            </p>
            <h2 className="mt-4 text-[32px] leading-[1.2] font-semibold md:text-[40px]">
              Quieres saber si Cafe Lectura puede ser para ti?
            </h2>
            <p className="mt-4 text-[18px] leading-8 text-[color:color-mix(in_srgb,var(--color-paper)_82%,white)]">
              Escribenos por WhatsApp y te contamos como funciona la membresia,
              que libros estan disponibles y de que forma se organizan los
              coloquios del club.
            </p>
          </div>
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
        </section>
      </div>
    </main>
  );
}
