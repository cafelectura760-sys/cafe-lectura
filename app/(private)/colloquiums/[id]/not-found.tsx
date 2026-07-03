import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";

export default function ColloquiumNotFound() {
  return (
    <PageShell>
      <section className="surface-card px-6 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
        <p className="eyebrow">Coloquio no encontrado</p>
        <h1 className="section-title mt-3 text-[var(--text-primary)]">
          No encontramos este coloquio
        </h1>
        <p className="body-copy mt-4 max-w-2xl">
          Es posible que el contenido haya sido movido, eliminado o que el
          enlace ya no esté disponible. Puedes volver al catálogo de coloquios
          para seguir leyendo.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/colloquiums" className="btn-primary">
            Volver a los coloquios
            <ArrowRight className="h-[18px] w-[18px]" />
          </Link>
          <Link href="/" className="btn-secondary">
            Volver al inicio
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
