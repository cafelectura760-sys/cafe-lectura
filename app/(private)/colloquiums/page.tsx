import type { Metadata } from "next";
import Link from "next/link";

import { logoutAction } from "@/lib/auth/actions";
import { requireActiveMembership } from "@/lib/auth/session";

type ColloquiumsPageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Colloquiums | Cafe Lectura",
  description: "Private colloquium area for active members.",
};

export default async function ColloquiumsPage(_: ColloquiumsPageProps) {
  const session = await requireActiveMembership();

  return (
    <main className="flex flex-1 bg-stone-100 px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-8 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
              Area privada
            </p>
            <h1 className="text-3xl font-semibold text-stone-900">Coloquios</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-700">
              Bienvenido, {session.profile.full_name}. La conexión con Supabase,
              la sesión SSR y la validación de membresía ya están funcionando.
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
            >
              Cerrar sesión
            </button>
          </form>
        </header>

        <section className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-stone-900">
            Fundación lista
          </h2>
          <p className="mt-4 text-base leading-7 text-stone-700">
            Todavía no hemos construido el catálogo real de coloquios, pero esta
            vista ya confirma que un usuario con membresía activa puede
            atravesar la capa de autenticación y autorización.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="font-semibold text-stone-900 underline underline-offset-4"
            >
              Volver al inicio
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
