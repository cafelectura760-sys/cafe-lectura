import type { Metadata } from "next";
import Link from "next/link";

import { logoutAction } from "@/lib/auth/actions";
import { requireActiveMembership } from "@/lib/auth/session";
import { getAvailableColloquiums } from "@/lib/colloquiums/data";

type ColloquiumsPageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Colloquiums | Cafe Lectura",
  description: "Private colloquium area for active members.",
};

function getExcerpt(content: string): string {
  const normalizedContent = content
    .replace(/\r\n?/g, "\n")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();

  if (normalizedContent.length <= 180) {
    return normalizedContent;
  }

  return `${normalizedContent.slice(0, 177).trim()}...`;
}

function formatDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "long",
  }).format(new Date(isoDate));
}

export default async function ColloquiumsPage(_: ColloquiumsPageProps) {
  const session = await requireActiveMembership();
  const colloquiums = await getAvailableColloquiums();

  return (
    <main className="flex flex-1 bg-stone-100 px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-8 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
              Area privada
            </p>
            <h1 className="text-3xl font-semibold text-stone-900">
              Coloquios disponibles
            </h1>
            <p className="max-w-2xl text-base leading-8 text-stone-700">
              Bienvenido, {session.profile.full_name}. Aqui puedes revisar los
              coloquios publicados para miembros activos y abrir cada lectura en
              detalle.
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
            >
              Cerrar sesion
            </button>
          </form>
        </header>

        {colloquiums.length === 0 ? (
          <section className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-stone-900">
              Todavia no hay coloquios publicados
            </h2>
            <p className="mt-4 text-base leading-8 text-stone-700">
              Cuando el equipo admin publique nuevos coloquios, apareceran aqui.
              Tu acceso privado ya esta funcionando correctamente.
            </p>
          </section>
        ) : (
          <section className="grid gap-6">
            {colloquiums.map((colloquium) => (
              <article
                key={colloquium.id}
                className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-6 lg:flex-row">
                  <div className="h-48 w-full max-w-40 overflow-hidden rounded-md bg-stone-200">
                    {colloquium.bookCoverImageUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={colloquium.bookCoverImageUrl}
                          alt={`Portada de ${colloquium.bookTitle}`}
                          className="h-full w-full object-cover"
                        />
                      </>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
                      {colloquium.bookTitle}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-stone-900">
                      {colloquium.title}
                    </h2>
                    <p className="mt-3 text-base text-stone-700">
                      {colloquium.bookAuthor} - Publicado el{" "}
                      {formatDateLabel(colloquium.publishedAt)}
                    </p>
                    <p className="mt-4 text-base leading-8 text-stone-700">
                      {getExcerpt(colloquium.content)}
                    </p>
                    <div className="mt-6">
                      <Link
                        href={`/colloquiums/${colloquium.id}`}
                        className="inline-flex min-h-12 items-center justify-center rounded-md bg-stone-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-stone-800"
                      >
                        Abrir coloquio
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
