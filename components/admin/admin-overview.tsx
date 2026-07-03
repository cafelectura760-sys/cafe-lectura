import type { ComponentType } from "react";
import Link from "next/link";
import {
  ActivityIcon,
  BookOpenTextIcon,
  BookTextIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";

import type { AdminColloquiumListItem } from "@/lib/colloquiums/types";
import type { KeepAliveStatus } from "@/lib/supabase/keepalive";
import {
  formatDateTimeLabel,
  getKeepAliveStatusLabel,
  getKeepAliveTone,
} from "@/lib/admin/ui";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_96%,white)] shadow-[0_18px_40px_rgba(31,26,23,0.05)]">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardDescription className="text-[13px] tracking-[0.08em] uppercase">
            {title}
          </CardDescription>
          <CardTitle className="text-[30px] leading-none">{value}</CardTitle>
        </div>
        <div className="rounded-[12px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_72%,white)] p-2.5">
          <Icon className="size-5 text-[var(--text-secondary)]" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  href,
  title,
  description,
  buttonLabel,
}: {
  href: string;
  title: string;
  description: string;
  buttonLabel: string;
}) {
  return (
    <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_94%,white)] shadow-[0_12px_28px_rgba(31,26,23,0.04)]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full sm:w-auto">
          <Link href={href}>
            <PlusIcon data-icon="inline-start" />
            {buttonLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function getKeepAliveToneClasses(status: KeepAliveStatus) {
  const tone = getKeepAliveTone(status);

  switch (tone) {
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "error":
      return "border-rose-200 bg-rose-50 text-rose-950";
  }
}

function getColloquiumStatusBadge(status: AdminColloquiumListItem["status"]) {
  return status === "published"
    ? { label: "Publicado", className: "bg-emerald-100 text-emerald-900" }
    : { label: "Borrador", className: "bg-amber-100 text-amber-900" };
}

export function AdminOverview({
  memberCount,
  bookCount,
  colloquiums,
  keepAliveStatus,
}: {
  memberCount: number;
  bookCount: number;
  colloquiums: AdminColloquiumListItem[];
  keepAliveStatus: KeepAliveStatus;
}) {
  const draftCount = colloquiums.filter(
    (colloquium) => colloquium.status === "draft",
  ).length;
  const publishedCount = colloquiums.length - draftCount;
  const recentColloquiums = colloquiums.slice(0, 5);

  return (
    <>
      <section className="grid gap-4 xl:grid-cols-4">
        <StatCard
          title="Miembros"
          value={String(memberCount)}
          description="Perfiles disponibles para acceso privado y administración."
          icon={UsersIcon}
        />
        <StatCard
          title="Libros"
          value={String(bookCount)}
          description="Entradas activas del catálogo interno y público."
          icon={BookTextIcon}
        />
        <StatCard
          title="Borradores"
          value={String(draftCount)}
          description="Coloquios todavía en edición antes de su publicación."
          icon={BookOpenTextIcon}
        />
        <StatCard
          title="Publicados"
          value={String(publishedCount)}
          description="Coloquios visibles para miembros dentro del área privada."
          icon={ActivityIcon}
        />
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card
          className={`border shadow-[0_18px_40px_rgba(31,26,23,0.05)] ${getKeepAliveToneClasses(keepAliveStatus)}`}
        >
          <CardHeader>
            <CardDescription className="font-semibold tracking-[0.08em] text-current/75 uppercase">
              Estado operativo
            </CardDescription>
            <CardTitle className="text-[24px]">
              {keepAliveStatus.isStale
                ? "Keep-alive requiere atención"
                : "Keep-alive funcionando con normalidad"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-3 text-[15px] leading-7">
              <p className="text-current">
                {keepAliveStatus.lastSucceededAt
                  ? `Última ejecución exitosa: ${formatDateTimeLabel(keepAliveStatus.lastSucceededAt)}.`
                  : "Todavía no hay una ejecución exitosa registrada."}
              </p>
              {keepAliveStatus.lastError ? (
                <p className="text-current/90">
                  Error reciente: {keepAliveStatus.lastError}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[280px] lg:grid-cols-1">
              <div className="rounded-[14px] border border-current/15 bg-white/60 px-4 py-3 text-sm leading-6">
                <p className="font-semibold">Job</p>
                <p>{keepAliveStatus.jobName}</p>
              </div>
              <div className="rounded-[14px] border border-current/15 bg-white/60 px-4 py-3 text-sm leading-6">
                <p className="font-semibold">Estado</p>
                <p>{getKeepAliveStatusLabel(keepAliveStatus.lastStatus)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_96%,white)] shadow-[0_18px_40px_rgba(31,26,23,0.05)]">
          <CardHeader>
            <CardDescription className="tracking-[0.08em] uppercase">
              Acciones rápidas
            </CardDescription>
            <CardTitle>Atajos del panel</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <QuickActionCard
              href="/admin/members/new"
              title="Miembros"
              description="Crear cuentas y ajustar vigencias."
              buttonLabel="Crear cuenta"
            />
            <QuickActionCard
              href="/admin/books/new"
              title="Libros"
              description="Registrar o actualizar entradas del catálogo."
              buttonLabel="Crear libro"
            />
            <QuickActionCard
              href="/admin/colloquiums/new"
              title="Coloquios"
              description="Iniciar un nuevo flujo editorial privado."
              buttonLabel="Crear coloquio"
            />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_96%,white)] shadow-[0_18px_40px_rgba(31,26,23,0.05)]">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <CardDescription className="tracking-[0.08em] uppercase">
                Actividad reciente
              </CardDescription>
              <CardTitle>Últimos coloquios actualizados</CardTitle>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/colloquiums">Ver módulo editorial</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentColloquiums.length > 0 ? (
              <div className="grid gap-3">
                {recentColloquiums.map((colloquium) => {
                  const badge = getColloquiumStatusBadge(colloquium.status);

                  return (
                    <Link
                      key={colloquium.id}
                      href={`/admin/colloquiums/${colloquium.id}`}
                      className="rounded-[14px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_70%,white)] px-4 py-4 transition-colors hover:bg-[color:color-mix(in_srgb,var(--surface-subtle)_80%,white)]"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">
                              {colloquium.title}
                            </h3>
                            <Badge className={badge.className}>
                              {badge.label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                            {colloquium.bookTitle}
                          </p>
                        </div>
                        <div className="text-sm leading-6 text-[var(--text-secondary)] md:text-right">
                          <p>
                            Actualizado:{" "}
                            {formatDateTimeLabel(colloquium.updatedAt)}
                          </p>
                          <p>
                            {colloquium.participantCount} participantes ·{" "}
                            {colloquium.blockCount} bloques
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm leading-7 text-[var(--text-secondary)]">
                Todavía no hay coloquios cargados para mostrar actividad
                reciente.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
