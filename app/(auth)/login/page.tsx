import type { Metadata } from "next";
import Link from "next/link";

import { GatePanel } from "@/components/gate-panel";
import { PageShell } from "@/components/page-shell";
import { PasswordField } from "@/components/password-field";
import { SiteHeader } from "@/components/site-header";
import { StatusBanner } from "@/components/status-banner";
import { loginAction } from "@/lib/auth/actions";
import { getAuthSession } from "@/lib/auth/session";

type LoginPageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages: Record<string, string> = {
  "invalid-credentials":
    "No pudimos iniciar sesion con esas credenciales. Revisa el correo y la contrasena.",
  "missing-fields": "Por favor completa el correo y la contrasena.",
  unexpected:
    "Ocurrio un problema al preparar tu acceso. Intenta nuevamente en unos segundos.",
};

export const metadata: Metadata = {
  title: "Iniciar sesion",
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
    <PageShell>
      <SiteHeader
        items={[
          { href: "/", label: "Inicio" },
          { href: "/library", label: "Biblioteca" },
          { href: "/login", label: "Iniciar sesion" },
        ]}
        activeHref="/login"
        description="Acceso para miembros existentes y administracion del club."
      />

      <GatePanel
        eyebrow="Cafe Lectura"
        title="Iniciar sesion"
        description="Accede con las credenciales entregadas por la administracion del club."
        footer={
          <Link href="/" className="editorial-link">
            Volver al inicio
          </Link>
        }
      >
        {session ? (
          <StatusBanner tone="success" title="Sesion ya iniciada">
            Ya hay una sesion activa para{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {session.email ?? "este usuario"}
            </span>
            .{" "}
            <Link
              href={
                session.profile?.role === "admin" ? "/admin" : "/colloquiums"
              }
              className="editorial-link"
            >
              Continuar
            </Link>
          </StatusBanner>
        ) : null}

        {error && errorMessages[error] ? (
          <StatusBanner tone="error">{errorMessages[error]}</StatusBanner>
        ) : null}

        <form action={loginAction} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="field-label">
              Correo electronico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="field-input"
            />
          </div>

          <PasswordField
            id="password"
            name="password"
            label="Contrasena"
            autoComplete="current-password"
            required
          />

          <button type="submit" className="btn-primary w-full">
            Entrar al club
          </button>
        </form>
      </GatePanel>
    </PageShell>
  );
}
