"use client";

import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AudioLinesIcon,
  BookOpenTextIcon,
  CalendarDaysIcon,
  EyeIcon,
  FileTextIcon,
  LinkIcon,
  UsersIcon,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DeleteColloquiumDialog } from "@/components/colloquiums/delete-colloquium-dialog";
import { PresentationDraftEditor } from "@/components/colloquiums/presentation-draft-editor";
import { PrivateRouteAction } from "@/components/colloquiums/private-route-action";
import {
  addColloquiumParticipantAction,
  createColloquiumAction,
  deleteColloquiumParticipantAction,
  updateColloquiumMetadataAction,
  updateColloquiumParticipantAction,
  updateColloquiumSlugAction,
} from "@/lib/colloquiums/actions";
import type { ColloquiumEditorFeedback } from "@/lib/colloquiums/editor-feedback";
import {
  getParticipantRoleLabel,
  getPublishedDateInputValue,
} from "@/lib/colloquiums/schemas";
import type {
  AdminColloquiumEditorRecord,
  BookOption,
  ColloquiumParticipantRecord,
  ColloquiumParticipantRole,
} from "@/lib/colloquiums/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type EditorTab = "basics" | "participants" | "presentation" | "publication";

type AdminColloquiumEditorProps = {
  books: BookOption[];
  colloquium: AdminColloquiumEditorRecord | null;
  feedback: ColloquiumEditorFeedback | null;
  mediaBucketName: string;
  mode: "create" | "edit";
};

const ROLE_OPTIONS: Array<{
  value: ColloquiumParticipantRole;
  label: string;
}> = [
  { value: "host", label: "Anfitrión" },
  { value: "presenter", label: "Ponente" },
  { value: "guest", label: "Invitado" },
  { value: "other", label: "Otro" },
];

const PARTICIPANT_GROUPS: Array<{
  role: ColloquiumParticipantRole;
  title: string;
  description: string;
}> = [
  {
    role: "host",
    title: "Anfitriones",
    description: "Participantes que conducen o presentan el coloquio.",
  },
  {
    role: "presenter",
    title: "Ponentes",
    description: "Voces principales que desarrollan la presentación.",
  },
  {
    role: "guest",
    title: "Invitados",
    description: "Participaciones invitadas dentro del flujo editorial.",
  },
  {
    role: "other",
    title: "Otros participantes",
    description: "Colaboradores que no encajan en los roles principales.",
  },
];

const EMPTY_PARTICIPANTS: ColloquiumParticipantRecord[] = [];

function surfaceCardClassName() {
  return "border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_95%,white)] shadow-[0_18px_40px_rgba(31,26,23,0.05)]";
}

function subtleCardClassName() {
  return "border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_78%,white)] shadow-[0_12px_28px_rgba(31,26,23,0.04)]";
}

function formatEditorialDate(dateValue: string): string {
  if (!dateValue) {
    return "Selecciona una fecha";
  }

  const parsedDate = new Date(`${dateValue}T12:00:00.000Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Selecciona una fecha";
  }

  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "long",
  }).format(parsedDate);
}

function normalizeEditorTab(value: string | null): EditorTab {
  return value === "participants" ||
    value === "presentation" ||
    value === "publication"
    ? value
    : "basics";
}

function buildEditorPath(
  pathname: string,
  searchParams: URLSearchParams,
  tab: EditorTab,
) {
  const nextSearchParams = new URLSearchParams(searchParams.toString());
  nextSearchParams.set("tab", tab);

  const query = nextSearchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function EditorFeedback({ feedback }: { feedback: ColloquiumEditorFeedback }) {
  return (
    <Card
      className={
        feedback.tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
          : "border-rose-200 bg-rose-50 text-rose-950"
      }
    >
      <CardContent className="px-5 py-5 text-base leading-7">
        {feedback.message}
      </CardContent>
    </Card>
  );
}

function EditorStatusBadge({
  status,
}: {
  status: AdminColloquiumEditorRecord["status"];
}) {
  return status === "published" ? (
    <Badge className="bg-emerald-100 text-emerald-900">Publicado</Badge>
  ) : (
    <Badge className="bg-amber-100 text-amber-900">Borrador</Badge>
  );
}

function EditorSummaryPill({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-12 items-center gap-3 rounded-[14px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_74%,white)] px-4 py-3">
      <div className="rounded-[10px] border border-[var(--border-default)] bg-white p-2">
        <Icon className="size-4 text-[var(--text-secondary)]" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--text-muted)] uppercase">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function PublishedDateField({
  value,
  inputName = "published_at",
}: {
  value: string;
  inputName?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={inputName}>Fecha de publicación</Label>
      <Input
        id={inputName}
        name={inputName}
        type="date"
        defaultValue={value}
        className="h-12 text-base"
      />
      <p className="text-sm leading-6 text-[var(--text-secondary)]">
        {formatEditorialDate(value)}
      </p>
    </div>
  );
}

function SlugSettings({
  colloquiumId,
  currentSlug,
  redirectTo,
}: {
  colloquiumId: string;
  currentSlug: string;
  redirectTo: string;
}) {
  return (
    <Card className={subtleCardClassName()}>
      <CardHeader>
        <CardTitle>URL interna</CardTitle>
        <CardDescription>
          Ajusta la dirección privada del coloquio solo si realmente lo
          necesitas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateColloquiumSlugAction} className="grid gap-4">
          <input type="hidden" name="colloquium_id" value={colloquiumId} />
          <input type="hidden" name="current_slug" value={currentSlug} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={currentSlug}
              className="h-12 text-base"
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="justify-self-start"
          >
            Guardar URL interna
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ParticipantCard({
  colloquiumId,
  currentSlug,
  redirectTo,
  participant,
}: {
  colloquiumId: string;
  currentSlug: string;
  redirectTo: string;
  participant: ColloquiumParticipantRecord;
}) {
  const [name, setName] = useState(participant.name);
  const [role, setRole] = useState<ColloquiumParticipantRole>(participant.role);

  return (
    <Card className={subtleCardClassName()}>
      <CardContent className="space-y-5 px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="eyebrow">Participante registrado</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {participant.name}
            </p>
          </div>
          <Badge className="bg-[color:color-mix(in_srgb,var(--surface-default)_82%,white)] text-[var(--text-primary)]">
            {getParticipantRoleLabel(participant.role)}
          </Badge>
        </div>

        <form action={updateColloquiumParticipantAction} className="grid gap-4">
          <input type="hidden" name="colloquium_id" value={colloquiumId} />
          <input type="hidden" name="participant_id" value={participant.id} />
          <input type="hidden" name="current_slug" value={currentSlug} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <div className="grid gap-2">
            <Label htmlFor={`participant-name-${participant.id}`}>Nombre</Label>
            <Input
              id={`participant-name-${participant.id}`}
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`participant-role-${participant.id}`}>Rol</Label>
            <select
              id={`participant-role-${participant.id}`}
              name="role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as ColloquiumParticipantRole)
              }
              className="h-12 rounded-md border border-[var(--border-default)] bg-white px-3 text-base text-[var(--text-primary)]"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            variant="outline"
            className="justify-self-start"
          >
            Guardar participante
          </Button>
        </form>

        <form action={deleteColloquiumParticipantAction}>
          <input type="hidden" name="colloquium_id" value={colloquiumId} />
          <input type="hidden" name="participant_id" value={participant.id} />
          <input type="hidden" name="current_slug" value={currentSlug} />
          <input type="hidden" name="redirect_to" value={redirectTo} />
          <Button type="submit" variant="destructive">
            Eliminar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AddParticipantForm({
  colloquiumId,
  currentSlug,
  redirectTo,
}: {
  colloquiumId: string;
  currentSlug: string;
  redirectTo: string;
}) {
  const [role, setRole] = useState<ColloquiumParticipantRole>("host");

  return (
    <Card className={subtleCardClassName()}>
      <CardHeader>
        <CardTitle>Agregar participante</CardTitle>
        <CardDescription>
          Registra anfitriones, ponentes o invitados para reutilizarlos en los
          bloques de audio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={addColloquiumParticipantAction} className="grid gap-4">
          <input type="hidden" name="colloquium_id" value={colloquiumId} />
          <input type="hidden" name="current_slug" value={currentSlug} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <div className="grid gap-2">
            <Label htmlFor="participant-name">Nombre</Label>
            <Input
              id="participant-name"
              name="name"
              className="h-12 text-base"
              placeholder="Ej.: Miguel Ángel Mendoza"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="participant-role">Rol</Label>
            <select
              id="participant-role"
              name="role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as ColloquiumParticipantRole)
              }
              className="h-12 rounded-md border border-[var(--border-default)] bg-white px-3 text-base text-[var(--text-primary)]"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="justify-self-start">
            Agregar participante
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdminColloquiumEditor({
  books,
  colloquium,
  feedback,
  mediaBucketName,
  mode,
}: AdminColloquiumEditorProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = normalizeEditorTab(searchParams.get("tab"));
  const redirectTo = useMemo(
    () =>
      buildEditorPath(
        pathname,
        new URLSearchParams(searchParams.toString()),
        activeTab,
      ),
    [activeTab, pathname, searchParams],
  );
  const participants = colloquium?.participants ?? EMPTY_PARTICIPANTS;
  const publicationDate = getPublishedDateInputValue(
    colloquium?.publishedAt ?? new Date().toISOString(),
  );
  const audioCount =
    colloquium?.presentationBlocks.filter((block) => block.type === "audio")
      .length ?? 0;
  const presentationEditorKey =
    colloquium?.presentationBlocks
      .map((block) =>
        block.type === "text"
          ? `${block.id}:text:${block.updatedAt}`
          : `${block.id}:audio:${block.updatedAt}:${block.asset?.id ?? "none"}`,
      )
      .join("|") ?? "presentation-empty";
  const groupedParticipants = useMemo(
    () =>
      PARTICIPANT_GROUPS.map((group) => ({
        ...group,
        participants: participants.filter(
          (participant) => participant.role === group.role,
        ),
      })).filter((group) => group.participants.length > 0),
    [participants],
  );

  function handleTabChange(nextTab: string) {
    const normalizedTab = normalizeEditorTab(nextTab);
    router.replace(
      buildEditorPath(
        pathname,
        new URLSearchParams(searchParams.toString()),
        normalizedTab,
      ),
      { scroll: false },
    );
  }

  return (
    <div className="space-y-6">
      <header className={surfaceCardClassName()}>
        <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/colloquiums">Volver a coloquios</Link>
              </Button>
              {mode === "edit" && colloquium ? (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/colloquiums/${colloquium.id}/preview`}>
                      <EyeIcon data-icon="inline-start" />
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
                    redirectTo="/admin/colloquiums"
                    title={colloquium.title}
                    triggerLabel="Eliminar coloquio"
                    triggerClassName="h-7 px-3 text-[0.8rem]"
                  />
                </>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow">Administración de coloquios</p>
              {mode === "edit" && colloquium ? (
                <EditorStatusBadge status={colloquium.status} />
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
              {mode === "create"
                ? "Crear coloquio"
                : (colloquium?.title ?? "Editar coloquio")}
            </h1>
            <p className="max-w-3xl text-[15px] leading-7 text-[var(--text-secondary)]">
              Este flujo se concentra en una sola experiencia visible para el
              MVP: la <strong>Presentación</strong>, compuesta por bloques de
              texto y audio ordenados.
            </p>
          </div>

          {mode === "edit" && colloquium ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <EditorSummaryPill
                icon={BookOpenTextIcon}
                label="Libro"
                value={colloquium.bookTitle}
              />
              <EditorSummaryPill
                icon={LinkIcon}
                label="Slug"
                value={colloquium.slug}
              />
              <EditorSummaryPill
                icon={UsersIcon}
                label="Participantes"
                value={String(participants.length)}
              />
              <EditorSummaryPill
                icon={FileTextIcon}
                label="Bloques"
                value={String(colloquium.presentationBlocks.length)}
              />
              <EditorSummaryPill
                icon={AudioLinesIcon}
                label="Audios"
                value={String(audioCount)}
              />
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <EditorSummaryPill
                icon={CalendarDaysIcon}
                label="Estado inicial"
                value="Borrador o publicado"
              />
              <EditorSummaryPill
                icon={UsersIcon}
                label="Participantes"
                value="Se habilitan al crear"
              />
              <EditorSummaryPill
                icon={AudioLinesIcon}
                label="Presentación"
                value="Se habilita al crear"
              />
            </div>
          )}
        </div>
      </header>

      {feedback ? <EditorFeedback feedback={feedback} /> : null}

      {mode === "create" ? (
        <Card className={surfaceCardClassName()}>
          <CardHeader>
            <CardTitle>1. Datos básicos y publicación</CardTitle>
            <CardDescription>
              Define el título, el libro, un resumen breve y el estado inicial.
              El resto del flujo se habilita automáticamente al crear el
              coloquio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createColloquiumAction} className="grid gap-5">
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <div className="grid gap-2">
                <Label htmlFor="title">Título del coloquio</Label>
                <Input id="title" name="title" className="h-12 text-base" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="book_id">Libro relacionado</Label>
                <select
                  id="book_id"
                  name="book_id"
                  className="h-12 rounded-md border border-[var(--border-default)] bg-white px-3 text-base text-[var(--text-primary)]"
                  defaultValue={books[0]?.id ?? ""}
                >
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} · {book.author}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="excerpt">Resumen breve</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  rows={4}
                  className="text-base"
                  placeholder="Describe brevemente qué encontrará el lector en esta presentación."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Estado inicial</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue="draft"
                  className="h-12 rounded-md border border-[var(--border-default)] bg-white px-3 text-base text-[var(--text-primary)]"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </select>
              </div>

              <PublishedDateField value={publicationDate} />

              <Button type="submit" className="justify-self-start">
                Crear coloquio
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : colloquium ? (
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="gap-4"
        >
          <TabsList variant="line" className="w-full md:w-fit">
            <TabsTrigger value="basics" className="flex-none">
              Datos básicos
            </TabsTrigger>
            <TabsTrigger value="participants" className="flex-none">
              Participantes
            </TabsTrigger>
            <TabsTrigger value="presentation" className="flex-none">
              Presentación
            </TabsTrigger>
            <TabsTrigger value="publication" className="flex-none">
              Publicación
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="mt-0">
            <Card className={surfaceCardClassName()}>
              <CardHeader>
                <CardTitle>Datos básicos</CardTitle>
                <CardDescription>
                  Ajusta el título editorial, el libro relacionado y un resumen
                  breve.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  action={updateColloquiumMetadataAction}
                  className="grid max-w-3xl gap-5"
                >
                  <input
                    type="hidden"
                    name="colloquium_id"
                    value={colloquium.id}
                  />
                  <input
                    type="hidden"
                    name="current_slug"
                    value={colloquium.slug}
                  />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <input
                    type="hidden"
                    name="status"
                    value={colloquium.status}
                  />
                  <input
                    type="hidden"
                    name="published_at"
                    value={publicationDate}
                  />

                  <div className="grid gap-2">
                    <Label htmlFor="edit-title">Título del coloquio</Label>
                    <Input
                      id="edit-title"
                      name="title"
                      defaultValue={colloquium.title}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-book">Libro relacionado</Label>
                    <select
                      id="edit-book"
                      name="book_id"
                      defaultValue={colloquium.bookId}
                      className="h-12 rounded-md border border-[var(--border-default)] bg-white px-3 text-base text-[var(--text-primary)]"
                    >
                      {books.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.title} · {book.author}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-excerpt">Resumen breve</Label>
                    <Textarea
                      id="edit-excerpt"
                      name="excerpt"
                      defaultValue={colloquium.excerpt ?? ""}
                      rows={4}
                      className="text-base"
                    />
                  </div>

                  <Button type="submit" className="justify-self-start">
                    Guardar datos básicos
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants" className="mt-0">
            <Card className={surfaceCardClassName()}>
              <CardHeader>
                <CardTitle>Participantes</CardTitle>
                <CardDescription>
                  Registra las personas que aparecerán asociadas a la
                  presentación. El listado se organiza por rol para que la
                  lectura y la edición sean más claras.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)] xl:items-start">
                  <AddParticipantForm
                    colloquiumId={colloquium.id}
                    currentSlug={colloquium.slug}
                    redirectTo={redirectTo}
                  />

                  <div className="space-y-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">
                          Participantes registrados
                        </h3>
                        <p className="text-sm leading-6 text-[var(--text-secondary)]">
                          {participants.length > 0
                            ? "Edita nombres y roles. El orden visible se resuelve por grupos de participación."
                            : "Todavía no hay participantes cargados."}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-[var(--text-muted)]">
                        {participants.length} en total
                      </p>
                    </div>

                    {participants.length > 0 ? (
                      <div className="space-y-5">
                        {groupedParticipants.map((group) => (
                          <Card
                            key={group.role}
                            className={subtleCardClassName()}
                          >
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {group.title}
                              </CardTitle>
                              <CardDescription>
                                {group.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-4 md:grid-cols-2">
                                {group.participants.map((participant) => (
                                  <ParticipantCard
                                    key={participant.id}
                                    colloquiumId={colloquium.id}
                                    currentSlug={colloquium.slug}
                                    redirectTo={redirectTo}
                                    participant={participant}
                                  />
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className={subtleCardClassName()}>
                        <CardContent className="px-5 py-5 text-base leading-7 text-[var(--text-secondary)]">
                          Todavía no hay participantes registrados para este
                          coloquio.
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="presentation" className="mt-0">
            <Card className={surfaceCardClassName()}>
              <CardHeader>
                <CardTitle>Presentación</CardTitle>
                <CardDescription>
                  Construye la secuencia visible del MVP con bloques de texto y
                  audio. Puedes reorganizar y editar sin recargar la página, y
                  guardar todo al final.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PresentationDraftEditor
                  key={presentationEditorKey}
                  colloquiumId={colloquium.id}
                  currentSlug={colloquium.slug}
                  mediaBucketName={mediaBucketName}
                  participants={participants}
                  presentationBlocks={colloquium.presentationBlocks}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publication" className="mt-0">
            <Card className={surfaceCardClassName()}>
              <CardHeader>
                <CardTitle>Publicación</CardTitle>
                <CardDescription>
                  Guarda el coloquio en borrador o publícalo cuando la
                  presentación esté lista.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] xl:items-start">
                <form
                  action={updateColloquiumMetadataAction}
                  className="grid gap-5"
                >
                  <input
                    type="hidden"
                    name="colloquium_id"
                    value={colloquium.id}
                  />
                  <input
                    type="hidden"
                    name="current_slug"
                    value={colloquium.slug}
                  />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <input type="hidden" name="title" value={colloquium.title} />
                  <input
                    type="hidden"
                    name="book_id"
                    value={colloquium.bookId}
                  />
                  <input
                    type="hidden"
                    name="excerpt"
                    value={colloquium.excerpt ?? ""}
                  />

                  <div className="grid gap-2">
                    <Label htmlFor="publication-status">Estado</Label>
                    <select
                      id="publication-status"
                      name="status"
                      defaultValue={colloquium.status}
                      className="h-12 rounded-md border border-[var(--border-default)] bg-white px-3 text-base text-[var(--text-primary)]"
                    >
                      <option value="draft">Borrador</option>
                      <option value="published">Publicado</option>
                    </select>
                  </div>

                  <PublishedDateField
                    value={publicationDate}
                    inputName="published_at"
                  />

                  <Button type="submit" className="justify-self-start">
                    Guardar publicación
                  </Button>
                </form>

                <SlugSettings
                  colloquiumId={colloquium.id}
                  currentSlug={colloquium.slug}
                  redirectTo={redirectTo}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}
