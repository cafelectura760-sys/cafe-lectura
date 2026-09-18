import Link from "next/link";

import { PageShell } from "@/components/page-shell";

export default function TestimonialNotFound() {
  return (
    <PageShell width="reading">
      <section className="surface-card px-6 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
        <p className="eyebrow">Testimonio no encontrado</p>
        <h1 className="section-title mt-3 text-[var(--text-primary)]">
          No encontramos este testimonio
        </h1>
        <p className="body-copy mt-4 max-w-2xl">
          Es posible que el enlace ya no esté disponible. Puedes volver al
          inicio y conocer los testimonios publicados por el club.
        </p>
        <div className="mt-8">
          <Link href="/#testimonios" className="btn-primary">
            Volver a los testimonios
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
