"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  formatMediaSizeLimit,
  getAllowedMimeTypes,
  getMediaSizeLimit,
} from "@/lib/colloquiums/schemas";
import type { MediaAssetRecord } from "@/lib/colloquiums/types";
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

type MediaAssetManagerProps = {
  bucketName: string;
  colloquiumId: string;
  sectionId: string;
  asset: MediaAssetRecord | null;
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

export function MediaAssetManager({
  bucketName,
  colloquiumId,
  sectionId,
  asset,
  title,
}: MediaAssetManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const allowedMimeTypes = getAllowedMimeTypes("audio");
  const maxSizeBytes = getMediaSizeLimit("audio");

  function validateSelectedFile(file: File) {
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

  async function handleUpload() {
    if (!selectedFile) {
      setFeedbackMessage("Selecciona un archivo antes de iniciar la subida.");
      return;
    }

    if (asset) {
      setFeedbackMessage(
        "Este bloque ya tiene un audio. Elimínalo primero si deseas reemplazarlo.",
      );
      return;
    }

    try {
      validateSelectedFile(selectedFile);
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
          confirmResult?.error ?? "No pudimos confirmar la subida del audio.",
        );
      }

      setSelectedFile(null);
      setFeedbackMessage("Audio subido correctamente.");
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
    setFeedbackMessage("Eliminando audio...");

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
          deleteResult.error ?? "No pudimos eliminar el audio seleccionado.",
        );
      }

      setFeedbackMessage("Audio eliminado correctamente.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error eliminando el audio.",
      );
    }
  }

  return (
    <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_92%,white)] shadow-[0_12px_28px_rgba(31,26,23,0.04)]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Sube un audio privado para este bloque de presentación. Formatos
          permitidos: {allowedMimeTypes.join(", ")}. Tamaño máximo:{" "}
          {formatMediaSizeLimit(maxSizeBytes)}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`${title}-file`}>Archivo de audio</Label>
            <Input
              id={`${title}-file`}
              type="file"
              accept={allowedMimeTypes.join(",")}
              className="h-12 cursor-pointer text-base"
              disabled={Boolean(asset) || isPending}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);

                if (!file) {
                  setFeedbackMessage(null);
                  return;
                }

                try {
                  validateSelectedFile(file);
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

          <Button
            type="button"
            onClick={() => void handleUpload()}
            disabled={!selectedFile || Boolean(asset) || isPending}
          >
            {isPending ? "Procesando..." : "Subir audio"}
          </Button>
        </div>

        {feedbackMessage ? (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {feedbackMessage}
          </p>
        ) : null}

        {asset ? (
          <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_74%,white)] shadow-none">
            <CardContent className="space-y-3 px-4 py-4">
              <div className="space-y-1">
                <p className="text-base font-semibold text-[var(--text-primary)]">
                  {asset.storageKey.split("/").at(-1) ?? "Audio"}
                </p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {asset.mimeType} ·{" "}
                  {asset.sizeBytes
                    ? `${Math.round(asset.sizeBytes / 1024)} KB`
                    : "Tamaño no disponible"}
                </p>
                {asset.durationSeconds ? (
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    Duración aproximada: {asset.durationSeconds} s
                  </p>
                ) : null}
              </div>

              {asset.signedUrl ? (
                <audio controls preload="metadata" className="w-full">
                  <source src={asset.signedUrl} type={asset.mimeType} />
                  Tu navegador no soporta la reproducción de audio.
                </audio>
              ) : (
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  El audio ya fue guardado, pero necesita la configuración de
                  Supabase Storage para reproducirse.
                </p>
              )}

              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleDelete(asset.id)}
                disabled={isPending}
              >
                Eliminar audio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_76%,white)] shadow-none">
            <CardContent className="px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
              Todavía no hay un audio asociado a este bloque.
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
