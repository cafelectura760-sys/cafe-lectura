import Link from "next/link";

import { ColloquiumReader } from "@/components/colloquiums/colloquium-reader";
import { PageShell } from "@/components/page-shell";
import { logoutAction } from "@/lib/auth/actions";
import type { ColloquiumDetail } from "@/lib/colloquiums/types";

type ColloquiumDetailPageShellProps = {
  colloquium: ColloquiumDetail;
  readerName: string;
};

export function ColloquiumDetailPageShell({
  colloquium,
  readerName,
}: ColloquiumDetailPageShellProps) {
  return (
    <PageShell width="reading" footer="none">
      <section className="surface-card-muted px-5 py-4 md:px-6 md:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-3">
            <Link href="/colloquiums" className="editorial-link">
              Volver a coloquios
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <p className="meta-copy">
                Leyendo como{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  {readerName}
                </span>
              </p>
              <span className="editorial-pill">Sala privada</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <Link href="/library" className="editorial-link">
              Biblioteca
            </Link>
            <Link href="/" className="editorial-link">
              Inicio
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="btn-ghost">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </section>

      <ColloquiumReader colloquium={colloquium} />
    </PageShell>
  );
}
