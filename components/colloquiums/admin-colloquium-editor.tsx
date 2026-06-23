"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronDown, Link2, Sparkles } from "lucide-react";
import { es } from "date-fns/locale";

import { DeleteColloquiumDialog } from "@/components/colloquiums/delete-colloquium-dialog";
import { MediaAssetManager } from "@/components/colloquiums/media-asset-manager";
import {
  addColloquiumEntryAction,
  addColloquiumSectionAction,
  createColloquiumAction,
  deleteColloquiumEntryAction,
  deleteColloquiumSectionAction,
  moveColloquiumEntryAction,
  moveColloquiumSectionAction,
  setColloquiumHeroImageAction,
  updateColloquiumEntryAction,
  updateColloquiumMetadataAction,
  updateColloquiumSectionAction,
  updateColloquiumSlugAction,
  updateMediaAssetMetadataAction,
} from "@/lib/colloquiums/actions";
import {
  formatMediaSizeLimit,
  getPublishedDateInputValue,
  MAX_AUDIO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/colloquiums/schemas";
import type {
  AdminColloquiumEditorRecord,
  BookOption,
  ColloquiumEntryRecord,
  ColloquiumSectionRecord,
  MediaAssetRecord,
} from "@/lib/colloquiums/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type FeedbackMessage = {
  tone: "success" | "error";
  message: string;
};

type AdminColloquiumEditorProps = {
  books: BookOption[];
  colloquium: AdminColloquiumEditorRecord | null;
  feedback: FeedbackMessage | null;
  mediaBucketName: string;
  mode: "create" | "edit";
};

const SECTION_OPTIONS = [
  {
    value: "intro",
    label: "Introducción",
    description:
      "Abre el coloquio con contexto inicial o una bienvenida breve.",
  },
  {
    value: "content",
    label: "Bloque de contenido",
    description:
      "Desarrolla ideas centrales, reflexiones o análisis editoriales.",
  },
  {
    value: "qa",
    label: "Preguntas y respuestas",
    description: "Agrupa intervenciones, preguntas, respuestas y aportes.",
  },
  {
    value: "audio",
    label: "Audio",
    description: "Sirve para asociar audios a una parte concreta del coloquio.",
  },
  {
    value: "image",
    label: "Imagen",
    description:
      "Agrupa imágenes asociadas a una parte específica del coloquio.",
  },
  {
    value: "closing",
    label: "Cierre",
    description: "Cierra el coloquio con una conclusión o reflexión final.",
  },
] as const;

const SECTION_LABELS = Object.fromEntries(
  SECTION_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ColloquiumSectionRecord["type"], string>;

const ENTRY_TYPE_OPTIONS = [
  { value: "question", label: "Pregunta" },
  { value: "answer", label: "Respuesta" },
  { value: "contribution", label: "Aporte" },
  { value: "comment", label: "Comentario" },
  { value: "central_idea", label: "Idea central" },
  { value: "closing", label: "Cierre" },
  { value: "other", label: "Otro" },
] as const;

const ENTRY_ROLE_OPTIONS = [
  { value: "reader", label: "Lector" },
  { value: "host", label: "Anfitrión" },
  { value: "presenter", label: "Ponente" },
  { value: "anonymous", label: "Anónimo" },
  { value: "other", label: "Otro" },
] as const;

function isTextSectionType(type: string): boolean {
  return type === "intro" || type === "content" || type === "closing";
}

function isMeaningfulEntry(input: {
  label: string;
  participantName: string;
  centralIdea: string;
  content: string;
}) {
  return Boolean(
    input.label.trim() ||
    input.participantName.trim() ||
    input.centralIdea.trim() ||
    input.content.trim(),
  );
}

function parseDateInput(dateValue: string): Date | undefined {
  if (!dateValue) {
    return undefined;
  }

  const [year, month, day] = dateValue.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function formatEditorialDate(dateValue: string): string {
  const parsedDate = parseDateInput(dateValue);

  if (!parsedDate) {
    return "Selecciona una fecha";
  }

  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "long",
  }).format(parsedDate);
}

function surfaceCardClassName() {
  return "border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_95%,white)] shadow-[0_18px_40px_rgba(31,26,23,0.05)]";
}

function subtleCardClassName() {
  return "border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_78%,white)] shadow-[0_12px_28px_rgba(31,26,23,0.04)]";
}

function EditorFeedback({ feedback }: { feedback: FeedbackMessage }) {
  return (
    <Card
      className={cn(
        feedback.tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
          : "border-rose-200 bg-rose-50 text-rose-950",
      )}
    >
      <CardContent className="px-5 py-5 text-base leading-7">
        {feedback.message}
      </CardContent>
    </Card>
  );
}

function PublishedDateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedDate = parseDateInput(value);

  return (
    <div className="grid gap-2">
      <Label htmlFor="published-date">Fecha de publicación</Label>
      <input type="hidden" name="published_at" value={value} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="published-date"
            type="button"
            variant="outline"
            className="justify-between px-4 py-6 text-base"
          >
            <span>{formatEditorialDate(value)}</span>
            <CalendarDays className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            locale={es}
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) {
                return;
              }

              const year = date.getFullYear();
              const month = `${date.getMonth() + 1}`.padStart(2, "0");
              const day = `${date.getDate()}`.padStart(2, "0");

              onChange(`${year}-${month}-${day}`);
            }}
          />
        </PopoverContent>
      </Popover>
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
  const [slug, setSlug] = useState(currentSlug);
  const canSave = slug.trim().length > 0 && slug.trim() !== currentSlug;

  return (
    <Collapsible className="rounded-xl border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_75%,white)]">
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="flex w-full items-center justify-between px-4 py-6 text-left text-base font-semibold"
        >
          <span className="flex items-center gap-2">
            <Link2 className="size-4" />
            Configuración avanzada: URL interna
          </span>
          <ChevronDown className="size-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t border-[var(--border-default)] px-4 py-5">
          <form action={updateColloquiumSlugAction} className="grid gap-4">
            <input type="hidden" name="colloquium_id" value={colloquiumId} />
            <input type="hidden" name="current_slug" value={currentSlug} />
            <input type="hidden" name="redirect_to" value={redirectTo} />

            <div className="grid gap-2">
              <Label htmlFor={`slug-${colloquiumId}`}>Slug</Label>
              <Input
                id={`slug-${colloquiumId}`}
                name="slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="url-interna-del-coloquio"
                className="h-12 text-base"
              />
            </div>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Este valor se usa en la URL privada del coloquio. Se genera
              automáticamente, pero puedes ajustarlo si hace falta.
            </p>
            <Button type="submit" disabled={!canSave} className="w-fit">
              Guardar URL interna
            </Button>
          </form>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function HeroImageForm({
  colloquiumId,
  currentSlug,
  redirectTo,
  assets,
  currentHeroAssetId,
}: {
  colloquiumId: string;
  currentSlug: string;
  redirectTo: string;
  assets: MediaAssetRecord[];
  currentHeroAssetId: string | null;
}) {
  const [heroAssetId, setHeroAssetId] = useState(currentHeroAssetId ?? "");
  const hasImages = assets.length > 0;
  const canSave = heroAssetId !== (currentHeroAssetId ?? "");

  return (
    <form action={setColloquiumHeroImageAction} className="grid gap-4">
      <input type="hidden" name="colloquium_id" value={colloquiumId} />
      <input type="hidden" name="current_slug" value={currentSlug} />
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <input type="hidden" name="asset_id" value={heroAssetId} />

      <div className="grid gap-2">
        <Label>Imagen principal</Label>
        <Select
          value={heroAssetId || "__none__"}
          onValueChange={(value) =>
            setHeroAssetId(value === "__none__" ? "" : value)
          }
        >
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Selecciona una imagen principal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Sin imagen principal</SelectItem>
            {assets.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.title ?? asset.storageKey.split("/").at(-1) ?? "Imagen"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {!hasImages ? (
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Primero sube al menos una imagen del coloquio para poder seleccionarla
          como imagen principal.
        </p>
      ) : null}
      <Button type="submit" variant="secondary" disabled={!canSave}>
        Guardar imagen principal
      </Button>
    </form>
  );
}

function EntryEditorCard({
  entry,
  colloquiumId,
  currentSlug,
  redirectTo,
  bucketName,
}: {
  entry: ColloquiumEntryRecord;
  colloquiumId: string;
  currentSlug: string;
  redirectTo: string;
  bucketName: string;
}) {
  const [type, setType] = useState(entry.type);
  const [role, setRole] = useState(entry.role);
  const [label, setLabel] = useState(entry.label ?? "");
  const [participantName, setParticipantName] = useState(
    entry.participantName ?? "",
  );
  const [participantLocation, setParticipantLocation] = useState(
    entry.participantLocation ?? "",
  );
  const [centralIdea, setCentralIdea] = useState(entry.centralIdea ?? "");
  const [content, setContent] = useState(entry.content ?? "");

  const isDirty =
    type !== entry.type ||
    role !== entry.role ||
    label !== (entry.label ?? "") ||
    participantName !== (entry.participantName ?? "") ||
    participantLocation !== (entry.participantLocation ?? "") ||
    centralIdea !== (entry.centralIdea ?? "") ||
    content !== (entry.content ?? "");

  const canSave =
    isDirty &&
    isMeaningfulEntry({
      label,
      participantName,
      centralIdea,
      content,
    });

  return (
    <Card className={subtleCardClassName()}>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap gap-2">
          <form action={moveColloquiumEntryAction}>
            <input type="hidden" name="colloquium_id" value={colloquiumId} />
            <input type="hidden" name="current_slug" value={currentSlug} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <input type="hidden" name="entry_id" value={entry.id} />
            <input type="hidden" name="section_id" value={entry.sectionId} />
            <input type="hidden" name="direction" value="up" />
            <Button type="submit" variant="outline">
              Subir
            </Button>
          </form>
          <form action={moveColloquiumEntryAction}>
            <input type="hidden" name="colloquium_id" value={colloquiumId} />
            <input type="hidden" name="current_slug" value={currentSlug} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <input type="hidden" name="entry_id" value={entry.id} />
            <input type="hidden" name="section_id" value={entry.sectionId} />
            <input type="hidden" name="direction" value="down" />
            <Button type="submit" variant="outline">
              Bajar
            </Button>
          </form>
          <form action={deleteColloquiumEntryAction}>
            <input type="hidden" name="colloquium_id" value={colloquiumId} />
            <input type="hidden" name="current_slug" value={currentSlug} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <input type="hidden" name="entry_id" value={entry.id} />
            <input type="hidden" name="section_id" value={entry.sectionId} />
            <Button type="submit" variant="destructive">
              Eliminar intervención
            </Button>
          </form>
        </div>
        <CardTitle>Intervención</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={updateColloquiumEntryAction} className="grid gap-5">
          <input type="hidden" name="colloquium_id" value={colloquiumId} />
          <input type="hidden" name="current_slug" value={currentSlug} />
          <input type="hidden" name="redirect_to" value={redirectTo} />
          <input type="hidden" name="entry_id" value={entry.id} />
          <input type="hidden" name="section_id" value={entry.sectionId} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="role" value={role} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as typeof type)}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTRY_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Rol</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as typeof role)}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTRY_ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Etiqueta breve</Label>
              <Input
                name="label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="grid gap-2">
              <Label>Nombre del participante</Label>
              <Input
                name="participant_name"
                value={participantName}
                onChange={(event) => setParticipantName(event.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Ubicación o contexto</Label>
              <Input
                name="participant_location"
                value={participantLocation}
                onChange={(event) => setParticipantLocation(event.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="grid gap-2">
              <Label>Idea central</Label>
              <Input
                name="central_idea"
                value={centralIdea}
                onChange={(event) => setCentralIdea(event.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Contenido</Label>
            <Textarea
              name="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={6}
              className="text-base"
            />
          </div>

          <Button type="submit" variant="secondary" disabled={!canSave}>
            Guardar intervención
          </Button>
        </form>

        <MediaAssetManager
          bucketName={bucketName}
          colloquiumId={colloquiumId}
          assetType="image"
          sectionId={entry.sectionId}
          entryId={entry.id}
          assets={entry.assets.filter((asset) => asset.type === "image")}
          title="Imágenes de la intervención"
        />
        <MediaAssetManager
          bucketName={bucketName}
          colloquiumId={colloquiumId}
          assetType="audio"
          sectionId={entry.sectionId}
          entryId={entry.id}
          assets={entry.assets.filter((asset) => asset.type === "audio")}
          title="Audios de la intervención"
        />
      </CardContent>
    </Card>
  );
}

function AddEntryForm({
  colloquiumId,
  currentSlug,
  redirectTo,
  sectionId,
}: {
  colloquiumId: string;
  currentSlug: string;
  redirectTo: string;
  sectionId: string;
}) {
  const [type, setType] = useState("question");
  const [role, setRole] = useState("reader");
  const [label, setLabel] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [participantLocation, setParticipantLocation] = useState("");
  const [centralIdea, setCentralIdea] = useState("");
  const [content, setContent] = useState("");

  const canCreate = isMeaningfulEntry({
    label,
    participantName,
    centralIdea,
    content,
  });

  return (
    <Card className={subtleCardClassName()}>
      <CardHeader>
        <CardTitle>Nueva intervención</CardTitle>
        <CardDescription>
          Agrega una pregunta, respuesta o aporte dentro de esta sección.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={addColloquiumEntryAction} className="grid gap-5">
          <input type="hidden" name="colloquium_id" value={colloquiumId} />
          <input type="hidden" name="current_slug" value={currentSlug} />
          <input type="hidden" name="redirect_to" value={redirectTo} />
          <input type="hidden" name="section_id" value={sectionId} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="role" value={role} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as typeof type)}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTRY_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Rol</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as typeof role)}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTRY_ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Etiqueta breve</Label>
              <Input
                name="label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="grid gap-2">
              <Label>Nombre del participante</Label>
              <Input
                name="participant_name"
                value={participantName}
                onChange={(event) => setParticipantName(event.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Ubicación o contexto</Label>
              <Input
                name="participant_location"
                value={participantLocation}
                onChange={(event) => setParticipantLocation(event.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="grid gap-2">
              <Label>Idea central</Label>
              <Input
                name="central_idea"
                value={centralIdea}
                onChange={(event) => setCentralIdea(event.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Contenido</Label>
            <Textarea
              name="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              className="text-base"
            />
          </div>

          <Button type="submit" disabled={!canCreate}>
            Añadir intervención
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SectionEditorCard({
  section,
  colloquiumId,
  currentSlug,
  redirectTo,
  bucketName,
}: {
  section: ColloquiumSectionRecord;
  colloquiumId: string;
  currentSlug: string;
  redirectTo: string;
  bucketName: string;
}) {
  const [type, setType] = useState(section.type);
  const [title, setTitle] = useState(section.title ?? "");
  const [content, setContent] = useState(section.content ?? "");
  const [isOpen, setIsOpen] = useState(false);

  const isDirty =
    type !== section.type ||
    title !== (section.title ?? "") ||
    content !== (section.content ?? "");

  const canSave =
    isDirty &&
    (!isTextSectionType(type) ||
      title.trim().length > 0 ||
      content.trim().length > 0);

  const showEntryArea = type === "qa" || section.entries.length > 0;
  const showImageArea =
    type === "image" || section.assets.some((asset) => asset.type === "image");
  const showAudioArea =
    type === "audio" || section.assets.some((asset) => asset.type === "audio");

  return (
    <Card className={surfaceCardClassName()}>
      <CardHeader className="gap-4">
        <div className="flex flex-wrap gap-2">
          <form action={moveColloquiumSectionAction}>
            <input type="hidden" name="colloquium_id" value={colloquiumId} />
            <input type="hidden" name="current_slug" value={currentSlug} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <input type="hidden" name="section_id" value={section.id} />
            <input type="hidden" name="direction" value="up" />
            <Button type="submit" variant="outline">
              Subir
            </Button>
          </form>
          <form action={moveColloquiumSectionAction}>
            <input type="hidden" name="colloquium_id" value={colloquiumId} />
            <input type="hidden" name="current_slug" value={currentSlug} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <input type="hidden" name="section_id" value={section.id} />
            <input type="hidden" name="direction" value="down" />
            <Button type="submit" variant="outline">
              Bajar
            </Button>
          </form>
          <form action={deleteColloquiumSectionAction}>
            <input type="hidden" name="colloquium_id" value={colloquiumId} />
            <input type="hidden" name="current_slug" value={currentSlug} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <input type="hidden" name="section_id" value={section.id} />
            <Button type="submit" variant="destructive">
              Eliminar sección
            </Button>
          </form>
        </div>
        <CardTitle>{SECTION_LABELS[section.type]}</CardTitle>
        <CardDescription>
          Ordena y completa esta parte del coloquio según su propósito
          editorial.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={updateColloquiumSectionAction} className="grid gap-5">
          <input type="hidden" name="colloquium_id" value={colloquiumId} />
          <input type="hidden" name="current_slug" value={currentSlug} />
          <input type="hidden" name="redirect_to" value={redirectTo} />
          <input type="hidden" name="section_id" value={section.id} />
          <input type="hidden" name="type" value={type} />

          <div className="grid gap-2">
            <Label>Tipo de sección</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as typeof type)}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Título de la sección</Label>
            <Input
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div className="grid gap-2">
            <Label>Contenido</Label>
            <Textarea
              name="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={7}
              className="text-base"
            />
          </div>

          {isTextSectionType(type) ? (
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Para este tipo de sección, debes indicar al menos un título o un
              contenido antes de guardar.
            </p>
          ) : null}

          <Button type="submit" variant="secondary" disabled={!canSave}>
            Guardar sección
          </Button>
        </form>

        {showImageArea ? (
          <MediaAssetManager
            bucketName={bucketName}
            colloquiumId={colloquiumId}
            assetType="image"
            sectionId={section.id}
            assets={section.assets.filter((asset) => asset.type === "image")}
            title="Imágenes de la sección"
          />
        ) : null}

        {showAudioArea ? (
          <MediaAssetManager
            bucketName={bucketName}
            colloquiumId={colloquiumId}
            assetType="audio"
            sectionId={section.id}
            assets={section.assets.filter((asset) => asset.type === "audio")}
            title="Audios de la sección"
          />
        ) : null}

        {showEntryArea ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Intervenciones
              </h3>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Usa este espacio para preguntas, respuestas y aportes de los
                participantes.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen((currentValue) => !currentValue)}
            >
              {isOpen ? "Ocultar formulario" : "Añadir intervención"}
            </Button>

            {isOpen ? (
              <AddEntryForm
                colloquiumId={colloquiumId}
                currentSlug={currentSlug}
                redirectTo={redirectTo}
                sectionId={section.id}
              />
            ) : null}

            {section.entries.map((entry) => (
              <EntryEditorCard
                key={entry.id}
                entry={entry}
                colloquiumId={colloquiumId}
                currentSlug={currentSlug}
                redirectTo={redirectTo}
                bucketName={bucketName}
              />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function getColloquiumEditorFeedbackMessage(
  searchParams: Record<string, string | string[] | undefined>,
): FeedbackMessage | null {
  const status =
    typeof searchParams.status === "string" ? searchParams.status : null;
  const error =
    typeof searchParams.error === "string" ? searchParams.error : null;

  const statusMessages: Record<string, string> = {
    "colloquium-created":
      "El coloquio fue creado correctamente. Ahora puedes completar su estructura.",
    "colloquium-updated":
      "Los datos básicos del coloquio fueron actualizados correctamente.",
    "colloquium-slug-updated": "La URL interna del coloquio fue actualizada.",
    "section-created": "La nueva sección fue añadida correctamente.",
    "section-updated": "La sección fue actualizada.",
    "section-deleted": "La sección fue eliminada.",
    "section-moved": "El orden de la sección fue actualizado.",
    "entry-created": "La intervención fue añadida correctamente.",
    "entry-updated": "La intervención fue actualizada.",
    "entry-deleted": "La intervención fue eliminada.",
    "entry-moved": "El orden de la intervención fue actualizado.",
    "hero-updated": "La imagen principal fue actualizada.",
    "asset-updated": "La metadata del archivo fue actualizada.",
  };

  if (status && statusMessages[status]) {
    return {
      tone: "success",
      message: statusMessages[status],
    };
  }

  if (!error) {
    return null;
  }

  const errorMessages: Record<string, string> = {
    "invalid-colloquium-title": "Debes indicar un título válido.",
    "invalid-colloquium-slug":
      "La URL interna no es válida. Usa solo letras, números y guiones.",
    "invalid-colloquium-status": "El estado seleccionado no es válido.",
    "invalid-colloquium-book-id":
      "Debes seleccionar un libro válido para el coloquio.",
    "invalid-colloquium-published-at": "La fecha de publicación no es válida.",
    "published-colloquium-needs-sections":
      "Para publicar un coloquio necesitas al menos una sección válida.",
    "colloquium-not-found": "No pudimos encontrar el coloquio solicitado.",
    "slug-already-exists":
      "Ya existe otro coloquio usando esa URL interna. Ajusta el valor e inténtalo de nuevo.",
    "invalid-section-type": "El tipo de sección seleccionado no es válido.",
    "invalid-section-content":
      "Las secciones de texto deben tener al menos un título o un contenido.",
    "invalid-section-order": "No pudimos mover esa sección.",
    "section-not-found": "No pudimos encontrar la sección solicitada.",
    "invalid-entry-type": "El tipo de intervención no es válido.",
    "invalid-entry-role": "El rol de la intervención no es válido.",
    "invalid-entry-order": "No pudimos mover esa intervención.",
    "entry-not-found": "No pudimos encontrar la intervención solicitada.",
    "invalid-media-asset": "El archivo seleccionado no es válido.",
  };

  return {
    tone: "error",
    message:
      errorMessages[error] ??
      "Ocurrió un error inesperado mientras se actualizaba el coloquio.",
  };
}

export function AdminColloquiumEditor({
  books,
  colloquium,
  feedback,
  mediaBucketName,
  mode,
}: AdminColloquiumEditorProps) {
  const redirectTo =
    mode === "create"
      ? "/admin/colloquiums/new"
      : `/admin/colloquiums/${colloquium?.id}`;
  const [title, setTitle] = useState(colloquium?.title ?? "");
  const [status, setStatus] = useState(colloquium?.status ?? "draft");
  const [bookId, setBookId] = useState(
    colloquium?.bookId ?? books[0]?.id ?? "",
  );
  const [publishedDate, setPublishedDate] = useState(
    getPublishedDateInputValue(
      colloquium?.publishedAt ?? new Date().toISOString(),
    ),
  );
  const [excerpt, setExcerpt] = useState(colloquium?.excerpt ?? "");

  const initialMetadata = useMemo(
    () => ({
      title: colloquium?.title ?? "",
      status: colloquium?.status ?? "draft",
      bookId: colloquium?.bookId ?? books[0]?.id ?? "",
      publishedDate: getPublishedDateInputValue(
        colloquium?.publishedAt ?? new Date().toISOString(),
      ),
      excerpt: colloquium?.excerpt ?? "",
    }),
    [books, colloquium],
  );

  const metadataDirty =
    title !== initialMetadata.title ||
    status !== initialMetadata.status ||
    bookId !== initialMetadata.bookId ||
    publishedDate !== initialMetadata.publishedDate ||
    excerpt !== initialMetadata.excerpt;

  const metadataReady =
    title.trim().length > 0 &&
    bookId.trim().length > 0 &&
    publishedDate.trim().length > 0 &&
    (mode === "create" ? metadataDirty : metadataDirty);

  const [newSectionType, setNewSectionType] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionContent, setNewSectionContent] = useState("");

  const canCreateSection =
    newSectionType.trim().length > 0 &&
    (!isTextSectionType(newSectionType) ||
      newSectionTitle.trim().length > 0 ||
      newSectionContent.trim().length > 0);

  const rootImageAssets =
    colloquium?.rootAssets.filter((asset) => asset.type === "image") ?? [];

  return (
    <main className="flex flex-1 bg-[var(--background-page)] px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase">
              Administración de coloquios
            </p>
            <h1 className="text-3xl font-semibold text-[var(--text-primary)]">
              {mode === "create" ? "Crear coloquio" : "Editar coloquio"}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
              Trabaja el coloquio en cinco pasos: datos básicos, imagen
              principal, estructura, ajustes avanzados y revisión final.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild type="button" variant="outline">
              <Link href="/admin">Volver al panel</Link>
            </Button>
            {colloquium ? (
              <Button asChild type="button" variant="secondary">
                <Link href={`/admin/colloquiums/${colloquium.id}/preview`}>
                  Previsualizar
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        {feedback ? <EditorFeedback feedback={feedback} /> : null}

        <Card className={surfaceCardClassName()}>
          <CardHeader>
            <CardTitle>1. Datos básicos</CardTitle>
            <CardDescription>
              Define el título, el libro relacionado, el estado, la fecha
              editorial y un resumen breve para identificar el coloquio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={
                mode === "create"
                  ? createColloquiumAction
                  : updateColloquiumMetadataAction
              }
              className="grid gap-5"
            >
              {colloquium ? (
                <>
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
                </>
              ) : null}
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="book_id" value={bookId} />
              {mode === "create" ? (
                <input type="hidden" name="slug" value="" />
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="colloquium-title">Título</Label>
                <Input
                  id="colloquium-title"
                  name="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ej. Conversación sobre La casa de los espíritus"
                  className="h-12 text-base"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Libro relacionado</Label>
                  <Select value={bookId} onValueChange={setBookId}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecciona un libro" />
                    </SelectTrigger>
                    <SelectContent>
                      {books.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title} · {book.author}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Estado</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as typeof status)}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <PublishedDateField
                value={publishedDate}
                onChange={setPublishedDate}
              />

              <div className="grid gap-2">
                <Label htmlFor="colloquium-excerpt">Resumen breve</Label>
                <Textarea
                  id="colloquium-excerpt"
                  name="excerpt"
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  rows={4}
                  placeholder="Resume en pocas líneas qué encontrará el lector en este coloquio."
                  className="text-base"
                />
              </div>

              <p className="rounded-xl border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_74%,white)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                Si eliges <strong>Publicado</strong>, el sistema verificará que
                el coloquio ya tenga al menos una sección válida antes de
                permitirlo.
              </p>

              <Button type="submit" disabled={!metadataReady} className="w-fit">
                {mode === "create" ? "Crear coloquio" : "Guardar datos básicos"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {colloquium ? (
          <>
            <Card className={surfaceCardClassName()}>
              <CardHeader>
                <CardTitle>2. Imagen principal</CardTitle>
                <CardDescription>
                  Sube imágenes generales del coloquio y selecciona cuál será la
                  imagen principal de la lectura.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <MediaAssetManager
                  bucketName={mediaBucketName}
                  colloquiumId={colloquium.id}
                  assetType="image"
                  assets={rootImageAssets}
                  title="Imágenes del coloquio"
                />

                <div className="space-y-5">
                  <HeroImageForm
                    colloquiumId={colloquium.id}
                    currentSlug={colloquium.slug}
                    redirectTo={redirectTo}
                    assets={rootImageAssets}
                    currentHeroAssetId={colloquium.heroImage?.id ?? null}
                  />

                  {rootImageAssets.map((asset) => (
                    <Card key={asset.id} className={subtleCardClassName()}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {asset.title ??
                            asset.storageKey.split("/").at(-1) ??
                            "Archivo"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form
                          action={updateMediaAssetMetadataAction}
                          className="grid gap-4"
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
                          <input
                            type="hidden"
                            name="redirect_to"
                            value={redirectTo}
                          />
                          <input
                            type="hidden"
                            name="asset_id"
                            value={asset.id}
                          />

                          <div className="grid gap-2">
                            <Label>Título del archivo</Label>
                            <Input
                              name="title"
                              defaultValue={asset.title ?? ""}
                              className="h-12 text-base"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Caption</Label>
                            <Textarea
                              name="caption"
                              defaultValue={asset.caption ?? ""}
                              rows={3}
                              className="text-base"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Texto alternativo</Label>
                            <Input
                              name="alt_text"
                              defaultValue={asset.altText ?? ""}
                              className="h-12 text-base"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Orden</Label>
                            <Input
                              name="display_order"
                              type="number"
                              min="0"
                              defaultValue={asset.displayOrder}
                              className="h-12 text-base"
                            />
                          </div>
                          <Button
                            type="submit"
                            variant="secondary"
                            className="w-fit"
                          >
                            Guardar datos del archivo
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={surfaceCardClassName()}>
              <CardHeader>
                <CardTitle>3. Estructura del coloquio</CardTitle>
                <CardDescription>
                  Organiza el coloquio por bloques claros. Para texto usa
                  introducción, bloque de contenido o cierre. Para media usa
                  audio o imagen. Para intervenciones usa preguntas y
                  respuestas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Card className={subtleCardClassName()}>
                  <CardHeader>
                    <CardTitle>Nueva sección</CardTitle>
                    <CardDescription>
                      {newSectionType
                        ? SECTION_OPTIONS.find(
                            (option) => option.value === newSectionType,
                          )?.description
                        : "Selecciona el tipo de sección que quieres añadir al coloquio."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      action={addColloquiumSectionAction}
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
                      <input
                        type="hidden"
                        name="redirect_to"
                        value={redirectTo}
                      />
                      <input type="hidden" name="type" value={newSectionType} />

                      <div className="grid gap-2">
                        <Label>Tipo de sección</Label>
                        <Select
                          value={newSectionType || undefined}
                          onValueChange={(value) => setNewSectionType(value)}
                        >
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Selecciona un tipo de sección" />
                          </SelectTrigger>
                          <SelectContent>
                            {SECTION_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Título de la sección</Label>
                        <Input
                          name="title"
                          value={newSectionTitle}
                          onChange={(event) =>
                            setNewSectionTitle(event.target.value)
                          }
                          className="h-12 text-base"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Contenido</Label>
                        <Textarea
                          name="content"
                          value={newSectionContent}
                          onChange={(event) =>
                            setNewSectionContent(event.target.value)
                          }
                          rows={6}
                          className="text-base"
                        />
                      </div>

                      {isTextSectionType(newSectionType) ? (
                        <p className="text-sm leading-6 text-[var(--text-secondary)]">
                          Las secciones de texto requieren al menos un título o
                          un contenido para poder crearse.
                        </p>
                      ) : null}

                      <Button
                        type="submit"
                        disabled={!canCreateSection}
                        className="w-fit"
                      >
                        Añadir sección
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {colloquium.sections.length === 0 ? (
                  <Card className={subtleCardClassName()}>
                    <CardContent className="px-4 py-5 text-base leading-7 text-[var(--text-secondary)]">
                      Todavía no hay secciones creadas. Empieza añadiendo la
                      primera para construir el coloquio.
                    </CardContent>
                  </Card>
                ) : null}

                {colloquium.sections.map((section) => (
                  <SectionEditorCard
                    key={section.id}
                    section={section}
                    colloquiumId={colloquium.id}
                    currentSlug={colloquium.slug}
                    redirectTo={redirectTo}
                    bucketName={mediaBucketName}
                  />
                ))}
              </CardContent>
            </Card>

            <Card className={surfaceCardClassName()}>
              <CardHeader>
                <CardTitle>4. Configuración avanzada</CardTitle>
                <CardDescription>
                  Ajusta la URL interna del coloquio solo si realmente lo
                  necesitas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SlugSettings
                  colloquiumId={colloquium.id}
                  currentSlug={colloquium.slug}
                  redirectTo={redirectTo}
                />
              </CardContent>
            </Card>

            <Card className="border-rose-200 bg-rose-50 shadow-[0_16px_34px_rgba(142,59,47,0.08)]">
              <CardHeader>
                <CardTitle>5. Zona de eliminación</CardTitle>
                <CardDescription>
                  Usa esta acción solo si realmente necesitas eliminar por
                  completo el coloquio y sus archivos privados.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-2xl text-sm leading-6 text-rose-900">
                  Se eliminarán el coloquio, sus secciones, intervenciones y
                  todos los archivos asociados en Supabase Storage.
                </p>
                <DeleteColloquiumDialog
                  colloquiumId={colloquium.id}
                  currentSlug={colloquium.slug}
                  redirectTo={redirectTo}
                  title={colloquium.title}
                />
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className={subtleCardClassName()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4" />
                Qué pasará después
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-base leading-7 text-[var(--text-secondary)]">
              <p>
                Cuando crees el coloquio, entrarás al editor completo para
                definir su imagen principal, construir las secciones y agregar
                los archivos de audio o imagen que necesites.
              </p>
              <p>
                Límite de imagen: {formatMediaSizeLimit(MAX_IMAGE_SIZE_BYTES)}.
                Límite de audio: {formatMediaSizeLimit(MAX_AUDIO_SIZE_BYTES)}.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
