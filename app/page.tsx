import type { Metadata } from "next";
import Link from "next/link";

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

  return (
    <main className="flex flex-1 bg-stone-100 px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="p-8 sm:p-10">
              <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
                Cafe Lectura
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-semibold text-stone-900 sm:text-5xl">
                Un espacio tranquilo para leer, conversar y volver a los libros.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-stone-700">
                Somos un club privado de lectura con membresia anual, biblioteca
                disponible para consulta y coloquios preparados para miembros
                activos. Todo se gestiona de forma cercana, sencilla y por
                contacto directo.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href={getMembershipHref()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-stone-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-stone-800"
                >
                  Consultar membresia
                </a>
                <Link
                  href="/library"
                  className="inline-flex min-h-12 items-center justify-center rounded-md border border-stone-300 px-5 py-3 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
                >
                  Ver biblioteca
                </Link>
              </div>
            </div>

            <aside className="border-t border-stone-200 bg-stone-50 p-8 sm:p-10 lg:border-t-0 lg:border-l">
              <h2 className="text-2xl font-semibold text-stone-900">
                Acceso para miembros
              </h2>

              {session ? (
                <div className="mt-5 space-y-4 text-base leading-7 text-stone-700">
                  <p>
                    Estas conectado como{" "}
                    <span className="font-semibold">
                      {session.profile?.full_name ?? session.email}
                    </span>
                    .
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/colloquiums"
                      className="inline-flex min-h-12 items-center justify-center rounded-md bg-stone-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-stone-800"
                    >
                      Ir a coloquios
                    </Link>
                    {session.profile?.role === "admin" ? (
                      <Link
                        href="/admin"
                        className="inline-flex min-h-12 items-center justify-center rounded-md border border-stone-300 px-4 py-3 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
                      >
                        Ir al panel admin
                      </Link>
                    ) : null}
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="min-h-12 w-full rounded-md border border-stone-300 px-4 py-3 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
                      >
                        Cerrar sesion
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-4 text-base leading-7 text-stone-700">
                  <p>
                    Si ya eres miembro, inicia sesion para entrar al area
                    privada de coloquios.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex min-h-12 items-center justify-center rounded-md border border-stone-300 px-5 py-3 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
                  >
                    Iniciar sesion
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Biblioteca visible",
              text: "Consulta los libros disponibles y solicita informacion por WhatsApp sin descargar archivos.",
            },
            {
              title: "Membresia anual",
              text: "La participacion se gestiona manualmente, con renovacion directa y sin pagos dentro de la plataforma.",
            },
            {
              title: "Coloquios privados",
              text: "Los miembros activos acceden a contenidos textuales preparados para leer con calma.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-semibold text-stone-900">
                {item.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-stone-700">
                {item.text}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
                Biblioteca
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-stone-900">
                Ultimos libros agregados
              </h2>
            </div>
            <Link
              href="/library"
              className="font-semibold text-stone-900 underline underline-offset-4"
            >
              Ver catalogo completo
            </Link>
          </div>

          {featuredBooks.length === 0 ? (
            <p className="mt-6 text-base leading-8 text-stone-700">
              La biblioteca publica esta en preparacion. Pronto veras aqui los
              primeros titulos disponibles.
            </p>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {featuredBooks.map((book) => (
                <article
                  key={book.id}
                  className="rounded-lg border border-stone-200 bg-stone-50 p-5"
                >
                  <h3 className="text-xl font-semibold text-stone-900">
                    {book.title}
                  </h3>
                  <p className="mt-2 text-base text-stone-700">{book.author}</p>
                  <p className="mt-4 line-clamp-4 text-base leading-7 text-stone-700">
                    {book.synopsis}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-stone-200 bg-stone-900 p-8 text-white shadow-sm">
          <h2 className="text-3xl font-semibold">
            Quieres saber si Cafe Lectura es para ti?
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-stone-200">
            Escribenos por WhatsApp y te contamos como funciona la membresia,
            que libros estan disponibles y como se organizan los coloquios.
          </p>
          <div className="mt-6">
            <a
              href={getMembershipHref()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 py-3 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
