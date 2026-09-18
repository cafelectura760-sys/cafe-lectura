import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";

export default function LibraryBookNotFound() {
  return (
    <PageShell>
      <section className="surface-card px-6 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
        <p className="eyebrow">Obra no encontrada</p>
        <h1 className="section-title mt-3 text-[var(--text-primary)]">
          No encontramos esta ficha dentro de la colección pública
        </h1>
        <p className="body-copy mt-4 max-w-2xl">
          Es posible que la obra haya sido retirada de la colección o que el
          enlace ya no esté disponible. Puedes volver a la colección y seguir
          explorando otras obras con calma.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/library" className="btn-primary">
            Volver a la colección
            <ArrowRight className="h-[18px] w-[18px]" />
          </Link>
          <Link href="/" className="btn-secondary">
            Ir al inicio
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
