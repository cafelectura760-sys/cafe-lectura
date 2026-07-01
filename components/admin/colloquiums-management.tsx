import Link from "next/link";

import { AdminPagination } from "@/components/admin/admin-pagination";
import type { AdminColloquiumListItem } from "@/lib/colloquiums/types";
import type { AdminPaginatedResult } from "@/lib/admin/ui";
import { createAdminPath, formatDateTimeLabel } from "@/lib/admin/ui";
import { DeleteColloquiumDialog } from "@/components/colloquiums/delete-colloquium-dialog";
import { PrivateRouteAction } from "@/components/colloquiums/private-route-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function getStatusBadge(status: AdminColloquiumListItem["status"]) {
  return status === "published"
    ? { label: "Publicado", className: "bg-emerald-100 text-emerald-900" }
    : { label: "Borrador", className: "bg-amber-100 text-amber-900" };
}

export function ColloquiumsManagement({
  colloquiumsPage,
  currentPath,
  selectedStatus,
}: {
  colloquiumsPage: AdminPaginatedResult<AdminColloquiumListItem>;
  currentPath: string;
  selectedStatus: "all" | "draft" | "published";
}) {
  const colloquiums = colloquiumsPage.items;
  const allPath = createAdminPath("/admin/colloquiums", {
    size: colloquiumsPage.size,
  });
  const draftPath = createAdminPath("/admin/colloquiums", {
    status: "draft",
    size: colloquiumsPage.size,
  });
  const publishedPath = createAdminPath("/admin/colloquiums", {
    status: "published",
    size: colloquiumsPage.size,
  });

  return (
    <>
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.16em] text-[var(--text-muted)] uppercase">
            Módulo editorial
          </p>
          <h2 className="mt-2 text-[28px] font-semibold text-[var(--text-primary)]">
            Gestión de coloquios
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
            El flujo editorial se mantiene enfocado en una presentación privada
            compuesta por bloques ordenados de texto y audio.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/colloquiums/new">Crear coloquio nuevo</Link>
        </Button>
      </section>

      <section>
        <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_96%,white)] shadow-[0_18px_40px_rgba(31,26,23,0.05)]">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <CardDescription className="tracking-[0.08em] uppercase">
                Listado editorial
              </CardDescription>
              <CardTitle>Coloquios registrados</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                variant={selectedStatus === "all" ? "default" : "outline"}
                size="sm"
              >
                <Link href={allPath}>Todos</Link>
              </Button>
              <Button
                asChild
                variant={selectedStatus === "draft" ? "default" : "outline"}
                size="sm"
              >
                <Link href={draftPath}>Borradores</Link>
              </Button>
              <Button
                asChild
                variant={selectedStatus === "published" ? "default" : "outline"}
                size="sm"
              >
                <Link href={publishedPath}>Publicados</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {colloquiums.length === 0 ? (
              <p className="text-sm leading-7 text-[var(--text-secondary)]">
                No hay coloquios que coincidan con el estado seleccionado.
              </p>
            ) : (
              <>
                <div className="hidden xl:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Libro</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Participantes</TableHead>
                        <TableHead>Bloques</TableHead>
                        <TableHead>Audios</TableHead>
                        <TableHead>Actualizado</TableHead>
                        <TableHead className="w-[340px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {colloquiums.map((colloquium) => {
                        const badge = getStatusBadge(colloquium.status);

                        return (
                          <TableRow key={colloquium.id}>
                            <TableCell className="align-top">
                              <div className="space-y-1 whitespace-normal">
                                <p className="font-semibold text-[var(--text-primary)]">
                                  {colloquium.title}
                                </p>
                                <p className="text-xs leading-5 text-[var(--text-muted)]">
                                  {colloquium.slug}
                                </p>
                                {colloquium.excerpt ? (
                                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                                    {colloquium.excerpt}
                                  </p>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell className="align-top text-sm text-[var(--text-secondary)]">
                              {colloquium.bookTitle}
                            </TableCell>
                            <TableCell className="align-top">
                              <Badge className={badge.className}>
                                {badge.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="align-top text-sm text-[var(--text-secondary)]">
                              {colloquium.participantCount}
                            </TableCell>
                            <TableCell className="align-top text-sm text-[var(--text-secondary)]">
                              {colloquium.blockCount}
                            </TableCell>
                            <TableCell className="align-top text-sm text-[var(--text-secondary)]">
                              {colloquium.audioBlockCount}
                            </TableCell>
                            <TableCell className="align-top text-sm text-[var(--text-secondary)]">
                              {formatDateTimeLabel(colloquium.updatedAt)}
                            </TableCell>
                            <TableCell className="align-top">
                              <div className="flex flex-wrap gap-2">
                                <Button asChild size="sm" variant="outline">
                                  <Link
                                    href={`/admin/colloquiums/${colloquium.id}`}
                                  >
                                    Editar
                                  </Link>
                                </Button>
                                <Button asChild size="sm" variant="outline">
                                  <Link
                                    href={`/admin/colloquiums/${colloquium.id}/preview`}
                                  >
                                    Preview
                                  </Link>
                                </Button>
                                <PrivateRouteAction
                                  slug={colloquium.slug}
                                  status={colloquium.status}
                                />
                                <DeleteColloquiumDialog
                                  colloquiumId={colloquium.id}
                                  currentSlug={colloquium.slug}
                                  redirectTo={currentPath}
                                  title={colloquium.title}
                                  triggerLabel="Eliminar"
                                  triggerClassName="h-7 px-3 text-[0.8rem]"
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-4 xl:hidden">
                  {colloquiums.map((colloquium) => {
                    const badge = getStatusBadge(colloquium.status);

                    return (
                      <Card
                        key={colloquium.id}
                        size="sm"
                        className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_72%,white)] shadow-none"
                      >
                        <CardContent className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                                {colloquium.title}
                              </h3>
                              <Badge className={badge.className}>
                                {badge.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)]">
                              {colloquium.bookTitle}
                            </p>
                            <p className="text-xs leading-6 text-[var(--text-muted)]">
                              {colloquium.participantCount} participantes ·{" "}
                              {colloquium.blockCount} bloques ·{" "}
                              {colloquium.audioBlockCount} audios
                            </p>
                            <p className="text-xs leading-6 text-[var(--text-muted)]">
                              Actualizado:{" "}
                              {formatDateTimeLabel(colloquium.updatedAt)}
                            </p>
                          </div>

                          {colloquium.excerpt ? (
                            <p className="text-sm leading-6 text-[var(--text-secondary)]">
                              {colloquium.excerpt}
                            </p>
                          ) : null}

                          <div className="flex flex-wrap gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link
                                href={`/admin/colloquiums/${colloquium.id}`}
                              >
                                Editar
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                              <Link
                                href={`/admin/colloquiums/${colloquium.id}/preview`}
                              >
                                Preview
                              </Link>
                            </Button>
                            <PrivateRouteAction
                              slug={colloquium.slug}
                              status={colloquium.status}
                            />
                            <DeleteColloquiumDialog
                              colloquiumId={colloquium.id}
                              currentSlug={colloquium.slug}
                              redirectTo={currentPath}
                              title={colloquium.title}
                              triggerLabel="Eliminar"
                              triggerClassName="h-7 px-3 text-[0.8rem]"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <AdminPagination
                  basePath="/admin/colloquiums"
                  pagination={colloquiumsPage}
                  extraParams={{
                    status: selectedStatus === "all" ? null : selectedStatus,
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
