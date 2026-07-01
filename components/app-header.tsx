import { logoutAction } from "@/lib/auth/actions";
import type { AuthSessionContext } from "@/lib/auth/types";
import { createWhatsAppHref } from "@/lib/whatsapp";

import {
  SiteHeader,
  type HeaderAction,
  type HeaderStatus,
} from "@/components/site-header";

type AppHeaderProps = {
  activeHref: "/" | "/library" | "/colloquiums" | "/login";
  description: string;
  session: AuthSessionContext | null;
};

function buildGuestActions(): HeaderAction[] {
  return [
    {
      kind: "link",
      href: createWhatsAppHref(
        "Me gustaría recibir información sobre la membresía anual de Cafe Lectura.",
      ),
      label: "Consultar membresía",
      tone: "warm",
      external: true,
    },
  ];
}

function buildAuthenticatedStatus(
  session: AuthSessionContext,
): HeaderStatus | undefined {
  const identity = session.profile?.full_name ?? session.email;

  if (!identity) {
    return undefined;
  }

  return {
    title: "Acceso activo",
    content: (
      <>
        Bienvenido,{" "}
        <span className="font-semibold text-[var(--text-primary)]">
          {identity}
        </span>
        .
      </>
    ),
  };
}

function buildAuthenticatedActions(): HeaderAction[] {
  return [
    {
      kind: "submit",
      action: logoutAction,
      label: "Cerrar sesión",
      tone: "ghost",
    },
  ];
}

export function AppHeader({
  activeHref,
  description,
  session,
}: AppHeaderProps) {
  const isAuthenticated = session !== null;

  return (
    <SiteHeader
      items={
        isAuthenticated
          ? [
              { href: "/", label: "Inicio" },
              { href: "/library", label: "Biblioteca" },
              { href: "/colloquiums", label: "Coloquios" },
              ...(session.profile?.role === "admin"
                ? [{ href: "/admin", label: "Panel de administración" }]
                : []),
            ]
          : [
              { href: "/", label: "Inicio" },
              { href: "/library", label: "Biblioteca" },
              { href: "/login", label: "Iniciar sesión" },
            ]
      }
      activeHref={activeHref}
      description={description}
      status={session ? buildAuthenticatedStatus(session) : undefined}
      actions={session ? buildAuthenticatedActions() : buildGuestActions()}
    />
  );
}
