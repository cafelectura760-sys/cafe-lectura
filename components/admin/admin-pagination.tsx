import Link from "next/link";

import type { AdminPaginatedResult } from "@/lib/admin/ui";
import { createAdminPath } from "@/lib/admin/ui";
import { Button } from "@/components/ui/button";

type AdminPaginationProps = {
  basePath: string;
  pagination: AdminPaginatedResult<unknown>;
  extraParams?: Record<string, string | number | null | undefined>;
};

export function AdminPagination({
  basePath,
  pagination,
  extraParams,
}: AdminPaginationProps) {
  if (pagination.totalItems === 0) {
    return null;
  }

  const rangeStart = (pagination.page - 1) * pagination.size + 1;
  const rangeEnd = Math.min(
    pagination.page * pagination.size,
    pagination.totalItems,
  );
  const previousPath =
    pagination.page > 1
      ? createAdminPath(basePath, {
          ...extraParams,
          page: pagination.page - 1,
          size: pagination.size,
        })
      : null;
  const nextPath =
    pagination.page < pagination.totalPages
      ? createAdminPath(basePath, {
          ...extraParams,
          page: pagination.page + 1,
          size: pagination.size,
        })
      : null;

  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_68%,white)] px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          Página {pagination.page} de {pagination.totalPages}
        </p>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Mostrando {rangeStart} a {rangeEnd} de {pagination.totalItems}{" "}
          registros.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {previousPath ? (
          <Button asChild variant="outline" size="sm">
            <Link href={previousPath}>Anterior</Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" disabled>
            Anterior
          </Button>
        )}

        {nextPath ? (
          <Button asChild variant="outline" size="sm">
            <Link href={nextPath}>Siguiente</Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" disabled>
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
}
