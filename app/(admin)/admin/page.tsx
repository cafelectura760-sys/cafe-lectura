import type { Metadata } from "next";
import Link from "next/link";

import { logoutAction } from "@/lib/auth/actions";
import { requireAdmin } from "@/lib/auth/session";

type AdminPageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin | Cafe Lectura",
  description: "Administrative area for Cafe Lectura.",
};

export default async function AdminPage(_: AdminPageProps) {
  const session = await requireAdmin();

  return (
    <main className="flex flex-1 bg-stone-100 px-6 py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-8 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
              Administracion
            </p>
            <h1 className="text-3xl font-semibold text-stone-900">
              Panel interno
            </h1>
            <p className="max-w-2xl text-base leading-7 text-stone-700">
              Hola, {session.profile.full_name}. Este panel confirma que el rol
              <span className="font-semibold"> admin </span>
              ya puede atravesar las reglas de acceso del sistema incluso sin
              depender de la vigencia de membresía.
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
            Siguiente paso
          </h2>
          <p className="mt-4 text-base leading-7 text-stone-700">
            La base de autorización ya está viva. Desde aquí podemos pasar a la
            creación manual de usuarios, gestión de libros y publicación de
            coloquios sin rehacer la fundación.
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
