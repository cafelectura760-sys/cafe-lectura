import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { GatePanel } from "@/components/gate-panel";
import { PageShell } from "@/components/page-shell";
import { PasswordField } from "@/components/password-field";
import { AppHeader } from "@/components/app-header";
import { StatusBanner } from "@/components/status-banner";
import { loginAction } from "@/lib/auth/actions";
import { getAuthSession } from "@/lib/auth/session";

type LoginPageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages: Record<string, string> = {
  "invalid-credentials":
    "No pudimos iniciar sesión con esas credenciales. Revisa el correo y la contraseña.",
  "missing-fields": "Por favor, completa el correo y la contraseña.",
  unexpected:
    "Ocurrió un problema al preparar tu acceso. Intenta nuevamente en unos segundos.",
};

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Acceso privado para miembros de Café Lectura.",
};

function normalizeErrorCode(error: string | string[] | undefined) {
  return typeof error === "string" ? error : undefined;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getAuthSession();

  if (session) {
    redirect("/");
  }

  const resolvedSearchParams = await searchParams;
  const error = normalizeErrorCode(resolvedSearchParams?.error);

  return (
    <PageShell>
      <AppHeader
        activeHref="/login"
        session={null}
        description="Acceso para miembros existentes y administración del club."
      />

      <GatePanel
        eyebrow="Café Lectura"
        title="Iniciar sesión"
        description="Accede con las credenciales entregadas por la administración del club."
        footer={
          <Link href="/" className="editorial-link">
            Volver al inicio
          </Link>
        }
      >
        {error && errorMessages[error] ? (
          <StatusBanner tone="error">{errorMessages[error]}</StatusBanner>
        ) : null}

        <form action={loginAction} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="field-label">
              Correo electrónico
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
            label="Contraseña"
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
