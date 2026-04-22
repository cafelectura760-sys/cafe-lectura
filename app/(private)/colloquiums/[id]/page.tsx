import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { logoutAction } from "@/lib/auth/actions";
import { requireActiveMembership } from "@/lib/auth/session";
import { getColloquiumById } from "@/lib/colloquiums/data";
import { renderSafeMarkdown } from "@/lib/markdown/render-markdown";

type ColloquiumDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Colloquium Detail | Cafe Lectura",
  description: "Detailed private colloquium view for Cafe Lectura members.",
};

function formatDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

export default async function ColloquiumDetailPage({
  params,
}: ColloquiumDetailPageProps) {
  await requireActiveMembership();
  const { id } = await params;
  const colloquium = await getColloquiumById(id);

  if (!colloquium) {
    notFound();
  }

  return (
    <main className="flex flex-1 bg-stone-100 px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
                Coloquio privado
              </p>
              <h1 className="text-4xl font-semibold text-stone-900">
                {colloquium.title}
              </h1>
              <p className="text-base leading-8 text-stone-700">
                Basado en{" "}
                <span className="font-semibold">{colloquium.bookTitle}</span> de{" "}
                {colloquium.bookAuthor}. Publicado el{" "}
                {formatDateLabel(colloquium.publishedAt)}.
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
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/colloquiums"
              className="font-semibold text-stone-900 underline underline-offset-4"
            >
              Volver a coloquios
            </Link>
            <Link
              href="/"
              className="font-semibold text-stone-900 underline underline-offset-4"
            >
              Volver al inicio
            </Link>
          </div>
        </header>

        {colloquium.bookCoverImageUrl ? (
          <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
            <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="bg-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={colloquium.bookCoverImageUrl}
                  alt={`Portada de ${colloquium.bookTitle}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8">
                <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
                  Libro relacionado
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-stone-900">
                  {colloquium.bookTitle}
                </h2>
                <p className="mt-3 text-base leading-8 text-stone-700">
                  {colloquium.bookAuthor}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <article className="space-y-6">
          {renderSafeMarkdown(colloquium.content)}
        </article>
      </div>
    </main>
  );
}
