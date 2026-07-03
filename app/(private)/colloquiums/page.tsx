import type { Metadata } from "next";

import { ColloquiumCard } from "@/components/colloquium-card";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { AppHeader } from "@/components/app-header";
import { requireActiveMembership } from "@/lib/auth/session";
import { getAvailableColloquiums } from "@/lib/colloquiums/data";

type ColloquiumsPageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Coloquios",
  description:
    "Espacio privado de coloquios para miembros activos de Café Lectura.",
};

export default async function ColloquiumsPage(_: ColloquiumsPageProps) {
  const session = await requireActiveMembership();
  const colloquiums = await getAvailableColloquiums();
  const leadColloquium = colloquiums[0];
  const remainingColloquiums = colloquiums.slice(1);

  return (
    <PageShell>
      <AppHeader
        activeHref="/colloquiums"
        session={session}
        description="Espacio privado para miembros activos con lecturas y conversaciones del club."
      />

      <section className="hero-band">
        <div className="relative z-10">
          <div className="accent-rule mb-5" />
          <SectionHeading
            eyebrow="Área privada"
            title="Coloquios disponibles"
            description={`Bienvenido, ${session.profile.full_name}. Aquí puedes revisar los coloquios publicados para miembros activos y abrir cada lectura en detalle.`}
          />
        </div>
      </section>

      {colloquiums.length === 0 ? (
        <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <h2 className="subsection-title text-[var(--text-primary)]">
            Todavía no hay coloquios publicados
          </h2>
          <p className="body-copy mt-4">
            Cuando el equipo de administración publique nuevos coloquios,
            aparecerán aquí. Tu acceso privado ya está funcionando
            correctamente.
          </p>
        </section>
      ) : (
        <section className="content-grid" aria-label="Coloquios publicados">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="editorial-note">
              <p className="eyebrow">Sala privada</p>
              <p className="body-copy mt-2">
                Abre cada coloquio con calma. El libro, la fecha y el extracto
                inicial están pensados para orientarte antes de entrar a leer.
              </p>
            </div>
            <p className="editorial-pill lg:justify-self-end">
              {colloquiums.length}{" "}
              {colloquiums.length === 1
                ? "coloquio publicado"
                : "coloquios publicados"}
            </p>
          </div>

          <div className="grid gap-5">
            {leadColloquium ? (
              <ColloquiumCard colloquium={leadColloquium} featured />
            ) : null}
            {remainingColloquiums.map((colloquium) => (
              <ColloquiumCard key={colloquium.id} colloquium={colloquium} />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
