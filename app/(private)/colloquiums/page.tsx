import type { Metadata } from "next";
import Link from "next/link";

import { ColloquiumCard } from "@/components/colloquium-card";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { SiteHeader } from "@/components/site-header";
import { StatusBanner } from "@/components/status-banner";
import { logoutAction } from "@/lib/auth/actions";
import { requireActiveMembership } from "@/lib/auth/session";
import { getAvailableColloquiums } from "@/lib/colloquiums/data";

type ColloquiumsPageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Coloquios",
  description: "Private colloquium area for active members.",
};

export default async function ColloquiumsPage(_: ColloquiumsPageProps) {
  const session = await requireActiveMembership();
  const colloquiums = await getAvailableColloquiums();

  return (
    <PageShell width="regular">
      <SiteHeader
        items={[
          { href: "/", label: "Inicio" },
          { href: "/library", label: "Biblioteca" },
          { href: "/colloquiums", label: "Coloquios" },
        ]}
        activeHref="/colloquiums"
        description="Espacio privado para miembros activos con lecturas y conversaciones del club."
        actions={
          <>
            <StatusBanner title="Acceso activo">
              Bienvenido,{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {session.profile.full_name}
              </span>
              .
            </StatusBanner>
            <div className="flex flex-wrap gap-3">
              <Link href="/library" className="btn-secondary">
                Ver biblioteca
              </Link>
              {session.profile.role === "admin" ? (
                <Link href="/admin" className="btn-ghost">
                  Panel admin
                </Link>
              ) : null}
              <form action={logoutAction}>
                <button type="submit" className="btn-ghost">
                  Cerrar sesion
                </button>
              </form>
            </div>
          </>
        }
      />

      <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <SectionHeading
          eyebrow="Area privada"
          title="Coloquios disponibles"
          description={`Bienvenido, ${session.profile.full_name}. Aqui puedes revisar los coloquios publicados para miembros activos y abrir cada lectura en detalle.`}
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="surface-card-muted px-5 py-5 md:px-6">
            <h2 className="text-[22px] font-semibold text-[var(--text-primary)]">
              Lectura con foco y contexto
            </h2>
            <p className="body-copy mt-3">
              Cada coloquio muestra el libro relacionado, la fecha de
              publicacion y un extracto inicial para ayudarte a elegir la
              lectura que quieres abrir.
            </p>
          </div>
          <StatusBanner title="Lectura privada y calmada">
            La experiencia minimiza el ruido visual para que el contenido tenga
            prioridad sobre la navegacion.
          </StatusBanner>
        </div>
      </section>

      {colloquiums.length === 0 ? (
        <section className="surface-card px-6 py-7 md:px-8 md:py-8">
          <h2 className="subsection-title text-[var(--text-primary)]">
            Todavia no hay coloquios publicados
          </h2>
          <p className="body-copy mt-4">
            Cuando el equipo admin publique nuevos coloquios, apareceran aqui.
            Tu acceso privado ya esta funcionando correctamente.
          </p>
        </section>
      ) : (
        <section className="content-grid" aria-label="Coloquios publicados">
          <p className="meta-copy">
            {colloquiums.length}{" "}
            {colloquiums.length === 1
              ? "coloquio publicado"
              : "coloquios publicados"}
          </p>
          {colloquiums.map((colloquium) => (
            <ColloquiumCard key={colloquium.id} colloquium={colloquium} />
          ))}
        </section>
      )}
    </PageShell>
  );
}
