"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  formatMediaSizeLimit,
  getAllowedMimeTypes,
  getMediaSizeLimit,
} from "@/lib/colloquiums/schemas";
import type { MediaAssetRecord, MediaAssetType } from "@/lib/colloquiums/types";
import { createClient } from "@/lib/supabase/client";
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

type MediaAssetManagerProps = {
  bucketName: string;
  colloquiumId: string;
  assetType: MediaAssetType;
  assets: MediaAssetRecord[];
  sectionId?: string | null;
  entryId?: string | null;
  title: string;
};

async function loadAudioDuration(file: File): Promise<number | null> {
  if (!file.type.startsWith("audio/")) {
    return null;
  }

  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    const objectUrl = URL.createObjectURL(file);

    audio.preload = "metadata";
    audio.src = objectUrl;
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(
        Number.isFinite(audio.duration)
          ? Number(audio.duration.toFixed(2))
          : null,
      );
    };
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
  });
}

function getUploadRules(assetType: MediaAssetType) {
  return {
    allowedMimeTypes: getAllowedMimeTypes(assetType),
    maxSizeBytes: getMediaSizeLimit(assetType),
  };
}

function validateSelectedFile(file: File, assetType: MediaAssetType) {
  const { allowedMimeTypes, maxSizeBytes } = getUploadRules(assetType);

  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error(
      `El archivo no tiene un formato permitido. Usa: ${allowedMimeTypes.join(", ")}.`,
    );
  }

  if (file.size <= 0 || file.size > maxSizeBytes) {
    throw new Error(
      `El archivo supera el límite permitido de ${formatMediaSizeLimit(maxSizeBytes)}.`,
    );
  }
}

export function MediaAssetManager({
  bucketName,
  colloquiumId,
  assetType,
  assets,
  sectionId,
  entryId,
  title,
}: MediaAssetManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetTitle, setAssetTitle] = useState("");
  const [assetCaption, setAssetCaption] = useState("");
  const [assetAltText, setAssetAltText] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const { allowedMimeTypes, maxSizeBytes } = getUploadRules(assetType);

  async function handleUpload() {
    if (!selectedFile) {
      setFeedbackMessage("Selecciona un archivo antes de iniciar la subida.");
      return;
    }

    try {
      validateSelectedFile(selectedFile, assetType);
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : "No pudimos validar el archivo seleccionado.",
      );
      return;
    }

    setFeedbackMessage("Preparando subida...");

    try {
      const supabase = createClient();
      const presignResponse = await fetch(
        "/api/admin/colloquium-media/presign",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            colloquiumId,
            sectionId,
            entryId,
            assetType,
            fileName: selectedFile.name,
            mimeType: selectedFile.type,
            sizeBytes: selectedFile.size,
          }),
        },
      );

      const presignResult = (await presignResponse.json()) as
        | {
            error?: string;
            uploadToken?: string;
            assetToken?: string;
            storageKey?: string;
          }
        | undefined;

      if (
        !presignResponse.ok ||
        !presignResult?.uploadToken ||
        !presignResult.assetToken ||
        !presignResult.storageKey
      ) {
        throw new Error(
          presignResult?.error ?? "No pudimos preparar la subida.",
        );
      }

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .uploadToSignedUrl(
          presignResult.storageKey,
          presignResult.uploadToken,
          selectedFile,
          {
            contentType: selectedFile.type,
          },
        );

      if (uploadError) {
        throw new Error(
          uploadError.message ??
            "La subida a Supabase Storage no se completó correctamente.",
        );
      }

      const durationSeconds = await loadAudioDuration(selectedFile);
      const confirmResponse = await fetch(
        "/api/admin/colloquium-media/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assetToken: presignResult.assetToken,
            storageKey: presignResult.storageKey,
            mimeType: selectedFile.type,
            sizeBytes: selectedFile.size,
            title: assetTitle || null,
            caption: assetCaption || null,
            altText: assetType === "image" ? assetAltText || null : null,
            durationSeconds,
          }),
        },
      );

      const confirmResult = (await confirmResponse.json()) as
        | {
            error?: string;
          }
        | undefined;

      if (!confirmResponse.ok) {
        throw new Error(
          confirmResult?.error ?? "No pudimos confirmar la subida del archivo.",
        );
      }

      setSelectedFile(null);
      setAssetTitle("");
      setAssetCaption("");
      setAssetAltText("");
      setFeedbackMessage("Archivo subido correctamente.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error durante la subida del archivo.",
      );
    }
  }

  async function handleDelete(assetId: string) {
    setFeedbackMessage("Eliminando archivo...");

    try {
      const deleteResponse = await fetch(
        `/api/admin/colloquium-media/${assetId}`,
        {
          method: "DELETE",
        },
      );
      const deleteResult = (await deleteResponse.json()) as { error?: string };

      if (!deleteResponse.ok) {
        throw new Error(
          deleteResult.error ?? "No pudimos eliminar el archivo seleccionado.",
        );
      }

      setFeedbackMessage("Archivo eliminado correctamente.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error eliminando el archivo.",
      );
    }
  }

  const canUpload = selectedFile !== null && !isPending;

  return (
    <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_92%,white)] shadow-[0_12px_28px_rgba(31,26,23,0.04)]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {assetType === "image"
            ? "Sube imágenes privadas asociadas a este bloque del coloquio."
            : "Sube audios privados asociados a este bloque del coloquio."}{" "}
          Formatos permitidos: {allowedMimeTypes.join(", ")}. Tamaño máximo:{" "}
          {formatMediaSizeLimit(maxSizeBytes)}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`${title}-file`}>Archivo</Label>
            <Input
              id={`${title}-file`}
              type="file"
              accept={allowedMimeTypes.join(",")}
              className="h-12 cursor-pointer text-base"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);

                if (!file) {
                  setFeedbackMessage(null);
                  return;
                }

                try {
                  validateSelectedFile(file, assetType);
                  setFeedbackMessage(null);
                } catch (error) {
                  setFeedbackMessage(
                    error instanceof Error
                      ? error.message
                      : "No pudimos validar el archivo seleccionado.",
                  );
                }
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label>Título del archivo</Label>
            <Input
              value={assetTitle}
              onChange={(event) => setAssetTitle(event.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div className="grid gap-2">
            <Label>Caption</Label>
            <Textarea
              value={assetCaption}
              onChange={(event) => setAssetCaption(event.target.value)}
              rows={3}
              className="text-base"
            />
          </div>

          {assetType === "image" ? (
            <div className="grid gap-2">
              <Label>Texto alternativo</Label>
              <Input
                value={assetAltText}
                onChange={(event) => setAssetAltText(event.target.value)}
                className="h-12 text-base"
              />
            </div>
          ) : null}

          <Button
            type="button"
            onClick={() => void handleUpload()}
            disabled={!canUpload}
          >
            {isPending ? "Procesando..." : "Subir archivo"}
          </Button>
        </div>

        {feedbackMessage ? (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {feedbackMessage}
          </p>
        ) : null}

        <div className="space-y-4">
          {assets.length === 0 ? (
            <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_76%,white)] shadow-none">
              <CardContent className="px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                Todavía no hay archivos asociados a este bloque.
              </CardContent>
            </Card>
          ) : (
            assets.map((asset) => (
              <Card
                key={asset.id}
                className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_74%,white)] shadow-none"
              >
                <CardContent className="space-y-3 px-4 py-4">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-[var(--text-primary)]">
                      {asset.title ??
                        asset.storageKey.split("/").at(-1) ??
                        "Archivo"}
                    </p>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {asset.mimeType} ·{" "}
                      {asset.sizeBytes
                        ? `${Math.round(asset.sizeBytes / 1024)} KB`
                        : "Tamaño no disponible"}
                    </p>
                    {asset.caption ? (
                      <p className="text-sm leading-6 text-[var(--text-secondary)]">
                        {asset.caption}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {asset.signedUrl ? (
                      <Button asChild type="button" variant="outline">
                        <a
                          href={asset.signedUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir archivo
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => void handleDelete(asset.id)}
                      disabled={isPending}
                    >
                      Eliminar archivo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
