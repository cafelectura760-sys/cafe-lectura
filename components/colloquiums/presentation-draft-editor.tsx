"use client";

import { useState, useTransition } from "react";
import {
  AudioLinesIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  FileTextIcon,
} from "lucide-react";

import { MediaAssetManager } from "@/components/colloquiums/media-asset-manager";
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
import { Textarea } from "@/components/ui/textarea";
import { savePresentationBlocksAction } from "@/lib/colloquiums/actions";
import type {
  ColloquiumParticipantRecord,
  ColloquiumParticipantRole,
  MediaAssetRecord,
  PresentationAudioBlockDraft,
  PresentationBlockDraft,
  PresentationBlockRecord,
  PresentationTextBlockDraft,
} from "@/lib/colloquiums/types";
import {
  getColloquiumEditorErrorMessage,
  getColloquiumEditorStatusMessage,
  type ColloquiumEditorFeedback,
} from "@/lib/colloquiums/editor-feedback";
import { getParticipantRoleLabel } from "@/lib/colloquiums/schemas";

const ROLE_OPTIONS: Array<{
  value: ColloquiumParticipantRole;
  label: string;
}> = [
  { value: "host", label: "Anfitrión" },
  { value: "presenter", label: "Ponente" },
  { value: "guest", label: "Invitado" },
  { value: "other", label: "Otro" },
];

type PresentationDraftTextBlock = PresentationTextBlockDraft & {
  asset: null;
};

type PresentationDraftAudioBlock = PresentationAudioBlockDraft & {
  asset: MediaAssetRecord | null;
};

type PresentationDraftBlock =
  | PresentationDraftTextBlock
  | PresentationDraftAudioBlock;

type PresentationDraftEditorProps = {
  colloquiumId: string;
  currentSlug: string;
  mediaBucketName: string;
  participants: ColloquiumParticipantRecord[];
  presentationBlocks: PresentationBlockRecord[];
};

function subtleCardClassName() {
  return "border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_78%,white)] shadow-[0_12px_28px_rgba(31,26,23,0.04)]";
}

function surfaceCardClassName() {
  return "border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_95%,white)] shadow-[0_18px_40px_rgba(31,26,23,0.05)]";
}

function createClientId(prefix: "text" | "audio") {
  return `${prefix}-${crypto.randomUUID()}`;
}

function createDraftBlocks(
  presentationBlocks: PresentationBlockRecord[],
): PresentationDraftBlock[] {
  return presentationBlocks.map((block) => {
    if (block.type === "text") {
      return {
        clientId: block.id,
        id: block.id,
        type: "text",
        content: block.content,
        asset: null,
      } satisfies PresentationDraftTextBlock;
    }

    return {
      clientId: block.id,
      id: block.id,
      type: "audio",
      label: block.label,
      participantId: block.participantId,
      speakerRole: block.speakerRole,
      speakerName: block.speakerName,
      asset: block.asset,
    } satisfies PresentationDraftAudioBlock;
  });
}

function moveBlock(
  blocks: PresentationDraftBlock[],
  index: number,
  direction: "up" | "down",
) {
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (swapIndex < 0 || swapIndex >= blocks.length) {
    return blocks;
  }

  const nextBlocks = [...blocks];
  const currentBlock = nextBlocks[index];

  nextBlocks[index] = nextBlocks[swapIndex];
  nextBlocks[swapIndex] = currentBlock;

  return nextBlocks;
}

function EditorInlineFeedback({
  feedback,
}: {
  feedback: ColloquiumEditorFeedback;
}) {
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

function PresentationBlockActions({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
  disabled,
}: {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onMoveUp}
        disabled={!canMoveUp || disabled}
      >
        <ArrowUpIcon data-icon="inline-start" />
        Mover arriba
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onMoveDown}
        disabled={!canMoveDown || disabled}
      >
        <ArrowDownIcon data-icon="inline-start" />
        Mover abajo
      </Button>
      <Button
        type="button"
        variant="destructive"
        onClick={onRemove}
        disabled={disabled}
      >
        Eliminar
      </Button>
    </div>
  );
}

function PresentationTextDraftCard({
  block,
  order,
  canMoveUp,
  canMoveDown,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
  disabled,
}: {
  block: PresentationDraftTextBlock;
  order: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (value: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  return (
    <Card className={subtleCardClassName()}>
      <CardHeader>
        <CardTitle>Bloque de texto</CardTitle>
        <CardDescription>
          Bloque {order}. Los cambios se aplican cuando guardas la presentación.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-2">
          <Label htmlFor={`presentation-text-${block.clientId}`}>Texto</Label>
          <Textarea
            id={`presentation-text-${block.clientId}`}
            value={block.content}
            onChange={(event) => onChange(event.target.value)}
            rows={6}
            className="text-base"
            disabled={disabled}
          />
        </div>

        <PresentationBlockActions
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRemove={onRemove}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}

function PresentationAudioDraftCard({
  block,
  order,
  participants,
  mediaBucketName,
  colloquiumId,
  hasPendingChanges,
  canMoveUp,
  canMoveDown,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onRemove,
  disabled,
}: {
  block: PresentationDraftAudioBlock;
  order: number;
  participants: ColloquiumParticipantRecord[];
  mediaBucketName: string;
  colloquiumId: string;
  hasPendingChanges: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUpdate: (
    updates: Partial<
      Pick<
        PresentationDraftAudioBlock,
        "label" | "participantId" | "speakerName" | "speakerRole"
      >
    >,
  ) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const isUsingRegisteredParticipant = Boolean(block.participantId);
  const selectedParticipant =
    participants.find(
      (participant) => participant.id === block.participantId,
    ) ?? null;
  const needsSaveBeforeUpload = !block.id;

  return (
    <Card className={subtleCardClassName()}>
      <CardHeader>
        <CardTitle>Bloque de audio</CardTitle>
        <CardDescription>
          Bloque {order}. Ajusta el bloque aquí y guarda al final para fijar el
          orden y los datos editoriales.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`presentation-audio-label-${block.clientId}`}>
              Etiqueta del audio
            </Label>
            <Input
              id={`presentation-audio-label-${block.clientId}`}
              value={block.label ?? ""}
              onChange={(event) => onUpdate({ label: event.target.value })}
              className="h-12 text-base"
              placeholder="Ej.: Introducción"
              disabled={disabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`presentation-audio-participant-${block.clientId}`}>
              Participante registrado
            </Label>
            <select
              id={`presentation-audio-participant-${block.clientId}`}
              value={block.participantId ?? ""}
              onChange={(event) =>
                onUpdate({ participantId: event.target.value || null })
              }
              className="h-12 rounded-md border border-[var(--border-default)] bg-white px-3 text-base text-[var(--text-primary)]"
              disabled={disabled}
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
                <Label htmlFor={`presentation-audio-name-${block.clientId}`}>
                  Nombre visible
                </Label>
                <Input
                  id={`presentation-audio-name-${block.clientId}`}
                  value={block.speakerName}
                  onChange={(event) =>
                    onUpdate({ speakerName: event.target.value })
                  }
                  className="h-12 text-base"
                  placeholder="Ej.: Miguel Ángel Mendoza"
                  disabled={disabled}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`presentation-audio-role-${block.clientId}`}>
                  Rol visible
                </Label>
                <select
                  id={`presentation-audio-role-${block.clientId}`}
                  value={block.speakerRole}
                  onChange={(event) =>
                    onUpdate({
                      speakerRole: event.target
                        .value as ColloquiumParticipantRole,
                    })
                  }
                  className="h-12 rounded-md border border-[var(--border-default)] bg-white px-3 text-base text-[var(--text-primary)]"
                  disabled={disabled}
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
        </div>

        {needsSaveBeforeUpload || !block.id ? (
          <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_92%,white)] shadow-none">
            <CardContent className="px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
              Guarda los cambios para habilitar la subida del audio de este
              bloque.
            </CardContent>
          </Card>
        ) : (
          <MediaAssetManager
            bucketName={mediaBucketName}
            colloquiumId={colloquiumId}
            sectionId={block.id}
            asset={block.asset}
            title="Audio del bloque"
            disabled={hasPendingChanges || disabled}
            disabledReason={
              hasPendingChanges
                ? "Guarda primero los cambios pendientes de la presentación para subir o eliminar audios."
                : null
            }
          />
        )}

        <PresentationBlockActions
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRemove={onRemove}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}

function AddTextDraftCard({
  onAdd,
  disabled,
}: {
  onAdd: (content: string) => void;
  disabled: boolean;
}) {
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleAdd() {
    const normalizedContent = content.trim();

    if (!normalizedContent) {
      setErrorMessage(
        "Debes escribir el contenido del bloque antes de añadirlo.",
      );
      return;
    }

    onAdd(normalizedContent);
    setContent("");
    setErrorMessage(null);
  }

  return (
    <Card className={subtleCardClassName()}>
      <CardHeader>
        <CardTitle>Agregar texto</CardTitle>
        <CardDescription>
          Inserta una introducción o un puente breve dentro de la presentación.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="new-presentation-text">Texto</Label>
          <Textarea
            id="new-presentation-text"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={5}
            className="text-base"
            disabled={disabled}
          />
        </div>

        {errorMessage ? (
          <p className="text-sm leading-6 text-rose-700">{errorMessage}</p>
        ) : null}

        <Button type="button" onClick={handleAdd} disabled={disabled}>
          <FileTextIcon data-icon="inline-start" />
          Agregar texto
        </Button>
      </CardContent>
    </Card>
  );
}

function AddAudioDraftCard({
  participants,
  onAdd,
  disabled,
}: {
  participants: ColloquiumParticipantRecord[];
  onAdd: (
    block: Omit<PresentationDraftAudioBlock, "clientId" | "id" | "asset">,
  ) => void;
  disabled: boolean;
}) {
  const [label, setLabel] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [speakerName, setSpeakerName] = useState("");
  const [speakerRole, setSpeakerRole] =
    useState<ColloquiumParticipantRole>("host");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isUsingRegisteredParticipant = participantId.length > 0;
  const selectedParticipant =
    participants.find((participant) => participant.id === participantId) ??
    null;

  function handleAdd() {
    if (!isUsingRegisteredParticipant && !speakerName.trim()) {
      setErrorMessage(
        "Debes indicar el nombre visible del audio o elegir un participante registrado.",
      );
      return;
    }

    onAdd({
      type: "audio",
      label: label.trim() || null,
      participantId: participantId || null,
      speakerName: speakerName.trim(),
      speakerRole,
    });
    setLabel("");
    setParticipantId("");
    setSpeakerName("");
    setSpeakerRole("host");
    setErrorMessage(null);
  }

  return (
    <Card className={subtleCardClassName()}>
      <CardHeader>
        <CardTitle>Agregar audio</CardTitle>
        <CardDescription>
          Crea el bloque en borrador y guarda la presentación para habilitar la
          subida del archivo.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="new-presentation-audio-label">
            Etiqueta del audio
          </Label>
          <Input
            id="new-presentation-audio-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="h-12 text-base"
            placeholder="Ej.: Audio 1"
            disabled={disabled}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="new-presentation-audio-participant">
            Participante registrado
          </Label>
          <select
            id="new-presentation-audio-participant"
            value={participantId}
            onChange={(event) => setParticipantId(event.target.value)}
            className="h-12 rounded-md border border-[var(--border-default)] bg-white px-3 text-base text-[var(--text-primary)]"
            disabled={disabled}
          >
            <option value="">Usar nombre manual</option>
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.name} · {getParticipantRoleLabel(participant.role)}
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
              <Label htmlFor="new-presentation-audio-name">
                Nombre visible
              </Label>
              <Input
                id="new-presentation-audio-name"
                value={speakerName}
                onChange={(event) => setSpeakerName(event.target.value)}
                className="h-12 text-base"
                placeholder="Ej.: Miguel Ángel Mendoza"
                disabled={disabled}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-presentation-audio-role">Rol visible</Label>
              <select
                id="new-presentation-audio-role"
                value={speakerRole}
                onChange={(event) =>
                  setSpeakerRole(
                    event.target.value as ColloquiumParticipantRole,
                  )
                }
                className="h-12 rounded-md border border-[var(--border-default)] bg-white px-3 text-base text-[var(--text-primary)]"
                disabled={disabled}
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

        {errorMessage ? (
          <p className="text-sm leading-6 text-rose-700">{errorMessage}</p>
        ) : null}

        <Button type="button" onClick={handleAdd} disabled={disabled}>
          <AudioLinesIcon data-icon="inline-start" />
          Agregar audio
        </Button>
      </CardContent>
    </Card>
  );
}

function PresentationSaveBar({
  hasPendingChanges,
  isSaving,
  onDiscard,
  onSave,
}: {
  hasPendingChanges: boolean;
  isSaving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  if (!hasPendingChanges) {
    return null;
  }

  return (
    <div className="sticky bottom-4 z-20">
      <Card className={surfaceCardClassName()}>
        <CardContent className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-base font-semibold text-[var(--text-primary)]">
              Tienes cambios pendientes en la presentación.
            </p>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Revisa el orden, el contenido y los audios nuevos antes de
              guardar.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onDiscard}
              disabled={isSaving}
            >
              Descartar cambios
            </Button>
            <Button type="button" onClick={onSave} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PresentationDraftEditor({
  colloquiumId,
  currentSlug,
  mediaBucketName,
  participants,
  presentationBlocks,
}: PresentationDraftEditorProps) {
  const [blocks, setBlocks] = useState<PresentationDraftBlock[]>(() =>
    createDraftBlocks(presentationBlocks),
  );
  const [feedback, setFeedback] = useState<ColloquiumEditorFeedback | null>(
    null,
  );
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isSaving, startSaving] = useTransition();

  function applyDraftUpdate(
    updater: (
      previousBlocks: PresentationDraftBlock[],
    ) => PresentationDraftBlock[],
  ) {
    setBlocks((previousBlocks) => updater(previousBlocks));
    setHasPendingChanges(true);
    setFeedback(null);
  }

  function handleDiscardChanges() {
    setBlocks(createDraftBlocks(presentationBlocks));
    setHasPendingChanges(false);
    setFeedback(null);
  }

  function handleSaveChanges() {
    startSaving(async () => {
      const blocksToSave: PresentationBlockDraft[] = blocks.map((block) =>
        block.type === "text"
          ? {
              clientId: block.clientId,
              id: block.id,
              type: "text",
              content: block.content,
            }
          : {
              clientId: block.clientId,
              id: block.id,
              type: "audio",
              label: block.label,
              participantId: block.participantId,
              speakerName: block.speakerName,
              speakerRole: block.speakerRole,
            },
      );

      const result = await savePresentationBlocksAction({
        colloquiumId,
        currentSlug,
        blocks: blocksToSave,
      });

      if (!result.ok) {
        setFeedback({
          tone: "error",
          message:
            getColloquiumEditorErrorMessage(result.error) ??
            "Ocurrió un error inesperado mientras se guardaba la presentación.",
        });
        return;
      }

      const existingAudioAssets = new Map(
        blocks
          .filter(
            (block): block is PresentationDraftAudioBlock =>
              block.type === "audio" && Boolean(block.id),
          )
          .map((block) => [block.id, block.asset] as const),
      );

      setBlocks(
        result.blocks.map((block) =>
          block.type === "text"
            ? {
                ...block,
                asset: null,
              }
            : {
                ...block,
                asset: block.id
                  ? (existingAudioAssets.get(block.id) ?? null)
                  : null,
              },
        ),
      );
      setHasPendingChanges(false);
      setFeedback({
        tone: "success",
        message:
          getColloquiumEditorStatusMessage("presentation-saved") ??
          "Los cambios de la presentación fueron guardados.",
      });
    });
  }

  const audioCount = blocks.filter((block) => block.type === "audio").length;

  return (
    <div className="space-y-6 pb-28">
      {feedback ? <EditorInlineFeedback feedback={feedback} /> : null}

      <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
        <AddTextDraftCard
          onAdd={(content) =>
            applyDraftUpdate((previousBlocks) => [
              ...previousBlocks,
              {
                clientId: createClientId("text"),
                id: null,
                type: "text",
                content,
                asset: null,
              },
            ])
          }
          disabled={isSaving}
        />
        <AddAudioDraftCard
          participants={participants}
          onAdd={(audioBlock) =>
            applyDraftUpdate((previousBlocks) => [
              ...previousBlocks,
              {
                clientId: createClientId("audio"),
                id: null,
                asset: null,
                ...audioBlock,
              },
            ])
          }
          disabled={isSaving}
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Secuencia actual
            </h3>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Reordena, edita y elimina bloques sin salir de esta pestaña.
            </p>
          </div>
          <p className="text-sm font-medium text-[var(--text-muted)]">
            {blocks.length} bloques · {audioCount} audios
          </p>
        </div>

        {blocks.length > 0 ? (
          <div className="grid gap-4">
            {blocks.map((block, index) =>
              block.type === "text" ? (
                <PresentationTextDraftCard
                  key={block.clientId}
                  block={block}
                  order={index + 1}
                  canMoveUp={index > 0}
                  canMoveDown={index < blocks.length - 1}
                  onChange={(value) =>
                    applyDraftUpdate((previousBlocks) =>
                      previousBlocks.map((currentBlock) =>
                        currentBlock.clientId === block.clientId &&
                        currentBlock.type === "text"
                          ? { ...currentBlock, content: value }
                          : currentBlock,
                      ),
                    )
                  }
                  onMoveUp={() =>
                    applyDraftUpdate((previousBlocks) =>
                      moveBlock(previousBlocks, index, "up"),
                    )
                  }
                  onMoveDown={() =>
                    applyDraftUpdate((previousBlocks) =>
                      moveBlock(previousBlocks, index, "down"),
                    )
                  }
                  onRemove={() =>
                    applyDraftUpdate((previousBlocks) =>
                      previousBlocks.filter(
                        (currentBlock) =>
                          currentBlock.clientId !== block.clientId,
                      ),
                    )
                  }
                  disabled={isSaving}
                />
              ) : (
                <PresentationAudioDraftCard
                  key={block.clientId}
                  block={block}
                  order={index + 1}
                  participants={participants}
                  mediaBucketName={mediaBucketName}
                  colloquiumId={colloquiumId}
                  hasPendingChanges={hasPendingChanges}
                  canMoveUp={index > 0}
                  canMoveDown={index < blocks.length - 1}
                  onUpdate={(updates) =>
                    applyDraftUpdate((previousBlocks) =>
                      previousBlocks.map((currentBlock) =>
                        currentBlock.clientId === block.clientId &&
                        currentBlock.type === "audio"
                          ? { ...currentBlock, ...updates }
                          : currentBlock,
                      ),
                    )
                  }
                  onMoveUp={() =>
                    applyDraftUpdate((previousBlocks) =>
                      moveBlock(previousBlocks, index, "up"),
                    )
                  }
                  onMoveDown={() =>
                    applyDraftUpdate((previousBlocks) =>
                      moveBlock(previousBlocks, index, "down"),
                    )
                  }
                  onRemove={() =>
                    applyDraftUpdate((previousBlocks) =>
                      previousBlocks.filter(
                        (currentBlock) =>
                          currentBlock.clientId !== block.clientId,
                      ),
                    )
                  }
                  disabled={isSaving}
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

      <PresentationSaveBar
        hasPendingChanges={hasPendingChanges}
        isSaving={isSaving}
        onDiscard={handleDiscardChanges}
        onSave={handleSaveChanges}
      />
    </div>
  );
}
