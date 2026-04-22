import type { Metadata } from "next";
import Link from "next/link";

import { loginAction } from "@/lib/auth/actions";
import { getAuthSession } from "@/lib/auth/session";

type LoginPageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages: Record<string, string> = {
  "invalid-credentials":
    "No pudimos iniciar sesión con esas credenciales. Revisa el correo y la contraseña.",
  "missing-fields": "Por favor completa el correo y la contraseña.",
  unexpected:
    "Ocurrió un problema al preparar tu acceso. Intenta nuevamente en unos segundos.",
};

export const metadata: Metadata = {
  title: "Login | Cafe Lectura",
  description: "Private member access for Cafe Lectura.",
};

function normalizeErrorCode(error: string | string[] | undefined) {
  return typeof error === "string" ? error : undefined;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAuthSession();
  const resolvedSearchParams = await searchParams;
  const error = normalizeErrorCode(resolvedSearchParams?.error);

  return (
    <main className="flex flex-1 items-center justify-center bg-stone-100 px-6 py-12">
      <div className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
            Cafe Lectura
          </p>
          <h1 className="text-3xl font-semibold text-stone-900">
            Iniciar sesión
          </h1>
          <p className="text-base leading-7 text-stone-700">
            Accede con las credenciales entregadas por la administración del
            club.
          </p>
        </div>

        {session ? (
          <div className="mt-8 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            Ya hay una sesión activa para{" "}
            <span className="font-semibold">
              {session.email ?? "este usuario"}
            </span>
            . Puedes continuar al área privada.
            <div className="mt-3">
              <Link
                href={
                  session.profile?.role === "admin" ? "/admin" : "/colloquiums"
                }
                className="font-semibold text-emerald-900 underline underline-offset-4"
              >
                Continuar
              </Link>
            </div>
          </div>
        ) : null}

        {error && errorMessages[error] ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
            {errorMessages[error]}
          </div>
        ) : null}

        <form action={loginAction} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-stone-800"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 transition outline-none focus:border-stone-500"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-stone-800"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 transition outline-none focus:border-stone-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-stone-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-stone-700"
          >
            Entrar al club
          </button>
        </form>
      </div>
    </main>
  );
}
