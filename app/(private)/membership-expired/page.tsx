import type { Metadata } from "next";
import Link from "next/link";

import { logoutAction } from "@/lib/auth/actions";
import { createWhatsAppHref } from "@/lib/whatsapp";

type MembershipExpiredPageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Membership Expired | Cafe Lectura",
  description: "Expired membership guidance for Cafe Lectura members.",
};

export default function MembershipExpiredPage(_: MembershipExpiredPageProps) {
  const whatsappHref = createWhatsAppHref(
    "Necesito ayuda para renovar mi membresía de Cafe Lectura.",
  );

  return (
    <main className="flex flex-1 items-center justify-center bg-stone-100 px-6 py-12">
      <div className="w-full max-w-2xl rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
            Membresía
          </p>
          <h1 className="text-3xl font-semibold text-stone-900">
            Tu acceso necesita renovación
          </h1>
          <p className="text-base leading-7 text-stone-700">
            Tu sesión está activa, pero la membresía registrada ya no permite
            entrar a los coloquios privados. Escríbenos por WhatsApp para
            ayudarte a renovarla.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-stone-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-stone-700"
          >
            Solicitar ayuda por WhatsApp
          </a>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-md border border-stone-300 px-4 py-3 text-base font-semibold text-stone-800 transition hover:bg-stone-100 sm:w-auto"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="font-semibold text-stone-900 underline underline-offset-4"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
