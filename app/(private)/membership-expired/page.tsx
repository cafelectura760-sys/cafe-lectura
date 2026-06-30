import type { Metadata } from "next";
import Link from "next/link";

import { GatePanel } from "@/components/gate-panel";
import { PageShell } from "@/components/page-shell";
import { SiteHeader } from "@/components/site-header";
import { StatusBanner } from "@/components/status-banner";
import { logoutAction } from "@/lib/auth/actions";
import { createWhatsAppHref } from "@/lib/whatsapp";

type MembershipExpiredPageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Membresía vencida",
  description:
    "Orientación para miembros con membresía vencida en Cafe Lectura.",
};

export default function MembershipExpiredPage(_: MembershipExpiredPageProps) {
  const whatsappHref = createWhatsAppHref(
    "Necesito ayuda para renovar mi membresía de Cafe Lectura.",
  );

  return (
    <PageShell width="regular">
      <SiteHeader
        items={[
          { href: "/", label: "Inicio" },
          { href: "/library", label: "Biblioteca" },
          { href: "/login", label: "Iniciar sesión" },
        ]}
        activeHref="/login"
        description="Orientación para renovar la membresía y recuperar el acceso privado."
      />

      <GatePanel
        eyebrow="Membresía"
        title="Tu acceso necesita renovación"
        description="Tu sesión está activa, pero la membresía registrada ya no permite entrar a los coloquios privados."
        footer={
          <Link href="/" className="editorial-link">
            Volver al inicio
          </Link>
        }
      >
        <StatusBanner tone="warning">
          Escríbenos por WhatsApp y te ayudamos a renovar tu membresía de forma
          directa y cercana.
        </StatusBanner>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="btn-warm"
          >
            Solicitar ayuda por WhatsApp
          </a>

          <form action={logoutAction}>
            <button type="submit" className="btn-secondary w-full sm:w-auto">
              Cerrar sesión
            </button>
          </form>
        </div>
      </GatePanel>
    </PageShell>
  );
}
