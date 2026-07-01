"use client";

import type { ComponentType } from "react";
import { useState } from "react";
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

import { DeleteColloquiumDialog } from "@/components/colloquiums/delete-colloquium-dialog";
import { MediaAssetManager } from "@/components/colloquiums/media-asset-manager";
import { PrivateRouteAction } from "@/components/colloquiums/private-route-action";
import {
  addColloquiumParticipantAction,
  addPresentationAudioBlockAction,
  addPresentationTextBlockAction,
  createColloquiumAction,
  deleteColloquiumParticipantAction,
  deletePresentationBlockAction,
  moveColloquiumParticipantAction,
  movePresentationBlockAction,
  updateColloquiumMetadataAction,
  updateColloquiumParticipantAction,
  updateColloquiumSlugAction,
  updatePresentationAudioBlockAction,
  updatePresentationTextBlockAction,
} from "@/lib/colloquiums/actions";
import {
  getParticipantRoleLabel,
  getPublishedDateInputValue,
} from "@/lib/colloquiums/schemas";
import type {
  AdminColloquiumEditorRecord,
  BookOption,
  ColloquiumParticipantRecord,
  ColloquiumParticipantRole,
  PresentationAudioBlockRecord,
  PresentationTextBlockRecord,
} from "@/lib/colloquiums/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const ROLE_OPTIONS: Array<{
  value: ColloquiumParticipantRole;
  label: string;
}> = [
  { value: "host", label: "Anfitrión" },
  { value: "presenter", label: "Ponente" },
  { value: "guest", label: "Invitado" },
  { value: "other", label: "Otro" },
];

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

function EditorFeedback({ feedback }: { feedback: FeedbackMessage }) {
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

function DirectionButtons({
  action,
  hiddenFields,
  disabledUp,
  disabledDown,
}: {
  action: (formData: FormData) => void;
  hiddenFields: Array<{ name: string; value: string }>;
  disabledUp: boolean;
  disabledDown: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <form action={action}>
        {hiddenFields.map((field) => (
          <input
            key={`up-${field.name}`}
            type="hidden"
            name={field.name}
            value={field.value}
          />
        ))}
        <input type="hidden" name="direction" value="up" />
        <Button type="submit" variant="outline" disabled={disabledUp}>
          Mover arriba
        </Button>
      </form>

      <form action={action}>
        {hiddenFields.map((field) => (
          <input
            key={`down-${field.name}`}
            type="hidden"
            name={field.name}
            value={field.value}
          />
        ))}
        <input type="hidden" name="direction" value="down" />
        <Button type="submit" variant="outline" disabled={disabledDown}>
          Mover abajo
        </Button>
      </form>
    </div>
  );
}

function ParticipantCard({
  colloquiumId,
  currentSlug,
  redirectTo,
  participant,
  order,
  isFirst,
  isLast,
}: {
  colloquiumId: string;
  currentSlug: string;
  redirectTo: string;
  participant: ColloquiumParticipantRecord;
  order: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [name, setName] = useState(participant.name);
  const [role, setRole] = useState<ColloquiumParticipantRole>(participant.role);

  return (
    <Card className={subtleCardClassName()}>
      <CardContent className="space-y-5 px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="eyebrow">Participante {order}</p>
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

        <div className="flex flex-wrap gap-3">
          <DirectionButtons
            action={moveColloquiumParticipantAction}
            hiddenFields={[
              { name: "colloquium_id", value: colloquiumId },
              { name: "participant_id", value: participant.id },
              { name: "current_slug", value: currentSlug },
              { name: "redirect_to", value: redirectTo },
            ]}
            disabledUp={isFirst}
            disabledDown={isLast}
          />

          <form action={deleteColloquiumParticipantAction}>
            <input type="hidden" name="colloquium_id" value={colloquiumId} />
            <input type="hidden" name="participant_id" value={participant.id} />
            <input type="hidden" name="current_slug" value={currentSlug} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <Button type="submit" variant="destructive">
              Eliminar
            </Button>
          </form>
        </div>
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

function TextBlockCard({
  colloquiumId,
  currentSlug,
  redirectTo,
  block,
  order,
  isFirst,
  isLast,
}: {
  colloquiumId: string;
  currentSlug: string;
  redirectTo: string;
  block: PresentationTextBlockRecord;
  order: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [content, setContent] = useState(block.content);

  return (
    <Card className={subtleCardClassName()}>
      <CardHeader>
        <CardTitle>Bloque de texto</CardTitle>
        <CardDescription>
          Bloque {order}. Úsalo para abrir la presentación o para insertar
          puentes breves entre audios.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={updatePresentationTextBlockAction} className="grid gap-4">
          <input type="hidden" name="colloquium_id" value={colloquiumId} />
          <input type="hidden" name="block_id" value={block.id} />
          <input type="hidden" name="current_slug" value={currentSlug} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <div className="grid gap-2">
            <Label htmlFor={`text-block-${block.id}`}>Texto</Label>
            <Textarea
              id={`text-block-${block.id}`}
              name="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={6}
              className="text-base"
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="justify-self-start"
          >
            Guardar bloque
          </Button>
        </form>

        <div className="flex flex-wrap gap-3">
          <DirectionButtons
            action={movePresentationBlockAction}
            hiddenFields={[
              { name: "colloquium_id", value: colloquiumId },
              { name: "block_id", value: block.id },
              { name: "current_slug", value: currentSlug },
              { name: "redirect_to", value: redirectTo },
            ]}
            disabledUp={isFirst}
            disabledDown={isLast}
          />

          <form action={deletePresentationBlockAction}>
            <input type="hidden" name="colloquium_id" value={colloquiumId} />
            <input type="hidden" name="block_id" value={block.id} />
            <input type="hidden" name="current_slug" value={currentSlug} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <Button type="submit" variant="destructive">
              Eliminar
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

function AudioBlockCard({
  colloquiumId,
  currentSlug,
  redirectTo,
  block,
  order,
  isFirst,
  isLast,
  participants,
  mediaBucketName,
}: {
  colloquiumId: string;
  currentSlug: string;
  redirectTo: string;
  block: PresentationAudioBlockRecord;
  order: number;
  isFirst: boolean;
  isLast: boolean;
  participants: ColloquiumParticipantRecord[];
  mediaBucketName: string;
}) {
  const [label, setLabel] = useState(block.label ?? "");
  const [participantId, setParticipantId] = useState(block.participantId ?? "");
  const [speakerName, setSpeakerName] = useState(
    block.participantId ? "" : block.speakerName,
  );
  const [speakerRole, setSpeakerRole] = useState<ColloquiumParticipantRole>(
    block.speakerRole,
  );
  const isUsingRegisteredParticipant = participantId.length > 0;
  const selectedParticipant =
    participants.find((participant) => participant.id === participantId) ??
    null;

  return (
    <Card className={subtleCardClassName()}>
      <CardHeader>
        <CardTitle>Bloque de audio</CardTitle>
        <CardDescription>
          Bloque {order}. Cada audio representa una intervención concreta dentro
          de la presentación.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form
          action={updatePresentationAudioBlockAction}
          className="grid gap-4"
        >
          <input type="hidden" name="colloquium_id" value={colloquiumId} />
          <input type="hidden" name="block_id" value={block.id} />
          <input type="hidden" name="current_slug" value={currentSlug} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <div className="grid gap-2">
            <Label htmlFor={`audio-label-${block.id}`}>
              Etiqueta del audio
            </Label>
            <Input
              id={`audio-label-${block.id}`}
              name="label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="h-12 text-base"
              placeholder="Ej.: Introducción"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`audio-participant-${block.id}`}>
              Participante registrado
            </Label>
            <select
              id={`audio-participant-${block.id}`}
              name="participant_id"
              value={participantId}
              onChange={(event) => setParticipantId(event.target.value)}
              className="h-12 rounded-md border border-[var(--border-default)] bg-white px-3 text-base text-[var(--text-primary)]"
            >
              <option value="">Usar nombre manual</option>
              {participants.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.name} ·{" "}
                  {getParticipantRoleLabel(participant.role)}
                </option>
              ))}
            </select>
          </div>

          {isUsingRegisteredParticipant ? (
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Este audio se mostrará como{" "}
              <strong>{selectedParticipant?.name ?? block.speakerName}</strong>{" "}
              con rol de{" "}
              <strong>
                {getParticipantRoleLabel(
                  selectedParticipant?.role ?? block.speakerRole,
                )}
              </strong>
              .
            </p>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor={`audio-speaker-name-${block.id}`}>
                  Nombre visible
                </Label>
                <Input
                  id={`audio-speaker-name-${block.id}`}
                  name="speaker_name"
                  value={speakerName}
                  onChange={(event) => setSpeakerName(event.target.value)}
                  className="h-12 text-base"
                  placeholder="Ej.: Miguel Ángel Mendoza"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`audio-speaker-role-${block.id}`}>
                  Rol visible
                </Label>
                <select
                  id={`audio-speaker-role-${block.id}`}
                  name="speaker_role"
                  value={speakerRole}
                  onChange={(event) =>
                    setSpeakerRole(
                      event.target.value as ColloquiumParticipantRole,
                    )
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
            </>
          )}

          <Button
            type="submit"
            variant="outline"
            className="justify-self-start"
          >
            Guardar bloque
          </Button>
        </form>

        <MediaAssetManager
          bucketName={mediaBucketName}
          colloquiumId={colloquiumId}
          sectionId={block.id}
          asset={block.asset}
          title="Audio del bloque"
        />

        <div className="flex flex-wrap gap-3">
          <DirectionButtons
            action={movePresentationBlockAction}
            hiddenFields={[
              { name: "colloquium_id", value: colloquiumId },
              { name: "block_id", value: block.id },
              { name: "current_slug", value: currentSlug },
              { name: "redirect_to", value: redirectTo },
            ]}
            disabledUp={isFirst}
            disabledDown={isLast}
          />

          <form action={deletePresentationBlockAction}>
            <input type="hidden" name="colloquium_id" value={colloquiumId} />
            <input type="hidden" name="block_id" value={block.id} />
            <input type="hidden" name="current_slug" value={currentSlug} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <Button type="submit" variant="destructive">
              Eliminar
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

function AddTextBlockForm({
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
        <CardTitle>Agregar texto</CardTitle>
        <CardDescription>
          Inserta una introducción o un puente breve dentro de la presentación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={addPresentationTextBlockAction} className="grid gap-4">
          <input type="hidden" name="colloquium_id" value={colloquiumId} />
          <input type="hidden" name="current_slug" value={currentSlug} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <div className="grid gap-2">
            <Label htmlFor="new-text-block">Texto</Label>
            <Textarea
              id="new-text-block"
              name="content"
              rows={5}
              className="text-base"
            />
          </div>

          <Button type="submit" className="justify-self-start">
            Agregar texto
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AddAudioBlockForm({
  colloquiumId,
  currentSlug,
  redirectTo,
  participants,
}: {
  colloquiumId: string;
  currentSlug: string;
  redirectTo: string;
  participants: ColloquiumParticipantRecord[];
}) {
  const [participantId, setParticipantId] = useState("");
  const [speakerRole, setSpeakerRole] =
    useState<ColloquiumParticipantRole>("host");
  const [speakerName, setSpeakerName] = useState("");
  const isUsingRegisteredParticipant = participantId.length > 0;
  const selectedParticipant =
    participants.find((participant) => participant.id === participantId) ??
    null;

  return (
    <Card className={subtleCardClassName()}>
      <CardHeader>
        <CardTitle>Agregar audio</CardTitle>
        <CardDescription>
          Crea el bloque y luego sube el archivo de audio privado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={addPresentationAudioBlockAction} className="grid gap-4">
          <input type="hidden" name="colloquium_id" value={colloquiumId} />
          <input type="hidden" name="current_slug" value={currentSlug} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <div className="grid gap-2">
            <Label htmlFor="new-audio-label">Etiqueta del audio</Label>
            <Input
              id="new-audio-label"
              name="label"
              className="h-12 text-base"
              placeholder="Ej.: Audio 1"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-audio-participant">
              Participante registrado
            </Label>
            <select
              id="new-audio-participant"
              name="participant_id"
              value={participantId}
              onChange={(event) => setParticipantId(event.target.value)}
              className="h-12 rounded-md border border-[var(--border-default)] bg-white px-3 text-base text-[var(--text-primary)]"
            >
              <option value="">Usar nombre manual</option>
              {participants.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.name} ·{" "}
                  {getParticipantRoleLabel(participant.role)}
                </option>
              ))}
            </select>
          </div>

          {isUsingRegisteredParticipant ? (
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Este bloque se mostrará como{" "}
              <strong>{selectedParticipant?.name ?? "Participante"}</strong> con
              rol de{" "}
              <strong>
                {selectedParticipant
                  ? getParticipantRoleLabel(selectedParticipant.role)
                  : "participante"}
              </strong>
              .
            </p>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="new-audio-speaker-name">Nombre visible</Label>
                <Input
                  id="new-audio-speaker-name"
                  name="speaker_name"
                  value={speakerName}
                  onChange={(event) => setSpeakerName(event.target.value)}
                  className="h-12 text-base"
                  placeholder="Ej.: Miguel Ángel Mendoza"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-audio-speaker-role">Rol visible</Label>
                <select
                  id="new-audio-speaker-role"
                  name="speaker_role"
                  value={speakerRole}
                  onChange={(event) =>
                    setSpeakerRole(
                      event.target.value as ColloquiumParticipantRole,
                    )
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
            </>
          )}

          <Button type="submit" className="justify-self-start">
            Agregar audio
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function getColloquiumEditorFeedbackMessage(
  searchParams: Record<string, string | string[] | undefined>,
): FeedbackMessage | null {
  const statusValue = searchParams.status;
  const errorValue = searchParams.error;
  const status = typeof statusValue === "string" ? statusValue : null;
  const error = typeof errorValue === "string" ? errorValue : null;

  const successMessages: Record<string, string> = {
    "colloquium-created":
      "El coloquio fue creado correctamente. Ahora puedes completar participantes y presentación.",
    "colloquium-updated": "Los datos del coloquio fueron actualizados.",
    "colloquium-slug-updated": "La URL interna del coloquio fue actualizada.",
    "participant-created": "El participante fue añadido correctamente.",
    "participant-updated": "Los datos del participante fueron actualizados.",
    "participant-deleted": "El participante fue eliminado.",
    "participant-moved": "El orden de los participantes fue actualizado.",
    "text-block-created": "El bloque de texto fue añadido correctamente.",
    "text-block-updated": "El bloque de texto fue actualizado.",
    "audio-block-created": "El bloque de audio fue añadido correctamente.",
    "audio-block-updated": "El bloque de audio fue actualizado.",
    "block-deleted": "El bloque fue eliminado.",
    "block-moved": "El orden de la presentación fue actualizado.",
  };

  if (status && status in successMessages) {
    return {
      tone: "success",
      message: successMessages[status],
    };
  }

  if (!error) {
    return null;
  }

  const errorMessages: Record<string, string> = {
    "invalid-colloquium-title": "Debes indicar un título válido.",
    "invalid-colloquium-slug": "La URL interna no es válida.",
    "invalid-colloquium-status": "El estado del coloquio no es válido.",
    "invalid-colloquium-book-id":
      "Debes seleccionar un libro válido para el coloquio.",
    "invalid-colloquium-published-at": "La fecha de publicación no es válida.",
    "published-colloquium-needs-audio":
      "Para publicar un coloquio necesitas al menos un bloque de audio con archivo subido.",
    "colloquium-not-found": "No pudimos encontrar el coloquio solicitado.",
    "slug-already-exists":
      "Ya existe otro coloquio usando esa URL interna. Ajusta el valor e inténtalo de nuevo.",
    "invalid-participant-name": "Debes indicar un nombre válido.",
    "invalid-participant-role": "El rol del participante no es válido.",
    "participant-not-found": "No pudimos encontrar el participante solicitado.",
    "invalid-block-type": "El tipo de bloque no es válido.",
    "invalid-text-block-content":
      "El bloque de texto necesita contenido para guardarse.",
    "invalid-audio-speaker-name":
      "Debes indicar el nombre visible del audio o elegir un participante registrado.",
    "invalid-audio-speaker-role": "Debes indicar un rol válido para el audio.",
    "invalid-block-order": "No pudimos mover ese bloque.",
    "block-not-found": "No pudimos encontrar el bloque solicitado.",
    "invalid-media-asset": "No pudimos validar el archivo de audio.",
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
  const redirectTo = colloquium
    ? `/admin/colloquiums/${colloquium.id}`
    : "/admin/colloquiums/new";
  const participants = colloquium?.participants ?? [];
  const publicationDate = getPublishedDateInputValue(
    colloquium?.publishedAt ?? null,
  );
  const audioCount =
    colloquium?.presentationBlocks.filter((block) => block.type === "audio")
      .length ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="rounded-[18px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_96%,white)] p-5 shadow-[0_18px_40px_rgba(31,26,23,0.05)] md:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
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

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow">Administración de coloquios</p>
              {mode === "edit" && colloquium ? (
                <EditorStatusBadge status={colloquium.status} />
              ) : null}
            </div>
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
        <>
          <Card className={surfaceCardClassName()}>
            <CardHeader>
              <CardTitle>1. Datos básicos y publicación</CardTitle>
              <CardDescription>
                Define el título, el libro, un resumen breve y el estado
                inicial. El resto del flujo se habilita automáticamente al crear
                el coloquio.
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
        </>
      ) : colloquium ? (
        <Tabs defaultValue="basics" className="gap-4">
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
                  presentación.
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
                            ? "Edita roles, nombres y orden de aparición."
                            : "Todavía no hay participantes cargados."}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-[var(--text-muted)]">
                        {participants.length} en total
                      </p>
                    </div>

                    {participants.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {participants.map((participant, index) => (
                          <ParticipantCard
                            key={participant.id}
                            colloquiumId={colloquium.id}
                            currentSlug={colloquium.slug}
                            redirectTo={redirectTo}
                            participant={participant}
                            order={index + 1}
                            isFirst={index === 0}
                            isLast={index === participants.length - 1}
                          />
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
                  audio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
                  <AddTextBlockForm
                    colloquiumId={colloquium.id}
                    currentSlug={colloquium.slug}
                    redirectTo={redirectTo}
                  />
                  <AddAudioBlockForm
                    colloquiumId={colloquium.id}
                    currentSlug={colloquium.slug}
                    redirectTo={redirectTo}
                    participants={participants}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--text-primary)]">
                        Secuencia actual
                      </h3>
                      <p className="text-sm leading-6 text-[var(--text-secondary)]">
                        Reordena el flujo con los controles de mover arriba y
                        mover abajo.
                      </p>
                    </div>
                    <p className="text-sm font-medium text-[var(--text-muted)]">
                      {colloquium.presentationBlocks.length} bloques ·{" "}
                      {audioCount} audios
                    </p>
                  </div>

                  {colloquium.presentationBlocks.length > 0 ? (
                    <div className="grid gap-4">
                      {colloquium.presentationBlocks.map((block, index) =>
                        block.type === "text" ? (
                          <TextBlockCard
                            key={block.id}
                            colloquiumId={colloquium.id}
                            currentSlug={colloquium.slug}
                            redirectTo={redirectTo}
                            block={block}
                            order={index + 1}
                            isFirst={index === 0}
                            isLast={
                              index === colloquium.presentationBlocks.length - 1
                            }
                          />
                        ) : (
                          <AudioBlockCard
                            key={block.id}
                            colloquiumId={colloquium.id}
                            currentSlug={colloquium.slug}
                            redirectTo={redirectTo}
                            block={block}
                            order={index + 1}
                            isFirst={index === 0}
                            isLast={
                              index === colloquium.presentationBlocks.length - 1
                            }
                            participants={participants}
                            mediaBucketName={mediaBucketName}
                          />
                        ),
                      )}
                    </div>
                  ) : (
                    <Card className={subtleCardClassName()}>
                      <CardContent className="px-5 py-5 text-base leading-7 text-[var(--text-secondary)]">
                        Todavía no hay bloques visibles en la presentación.
                      </CardContent>
                    </Card>
                  )}
                </div>
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
