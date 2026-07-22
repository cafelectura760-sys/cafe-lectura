"use client";

import type { CSSProperties } from "react";
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
import { Textarea } from "@/components/ui/textarea";

type FlyerAssetManagerProps = {
  bucketName: string;
  colloquiumId: string;
  colloquiumTitle: string;
  asset: MediaAssetRecord | null;
};

export function FlyerAssetManager({
  bucketName,
  colloquiumId,
  colloquiumTitle,
  asset,
}: FlyerAssetManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState(asset?.caption ?? "");
  const [altText, setAltText] = useState(
    asset?.altText ?? `Flyer del coloquio ${colloquiumTitle}`,
  );
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const allowedMimeTypes = getAllowedMimeTypes("image");
  const maxSizeBytes = getMediaSizeLimit("image");

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
      setFeedbackMessage("Selecciona una imagen antes de iniciar la subida.");
      return;
    }

    try {
      validateSelectedFile(selectedFile);
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : "No pudimos validar la imagen seleccionada.",
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            colloquiumId,
            sectionId: null,
            assetType: "image",
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
          { contentType: selectedFile.type },
        );

      if (uploadError) {
        throw new Error(
          uploadError.message ??
            "La subida a Supabase Storage no se completó correctamente.",
        );
      }

      const confirmResponse = await fetch(
        "/api/admin/colloquium-media/confirm",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetToken: presignResult.assetToken,
            storageKey: presignResult.storageKey,
            mimeType: selectedFile.type,
            sizeBytes: selectedFile.size,
            caption: caption.trim() || null,
            altText: altText.trim() || `Flyer del coloquio ${colloquiumTitle}`,
          }),
        },
      );
      const confirmResult = (await confirmResponse.json()) as {
        error?: string;
      };

      if (!confirmResponse.ok) {
        throw new Error(
          confirmResult.error ?? "No pudimos confirmar la subida del flyer.",
        );
      }

      setSelectedFile(null);
      setFeedbackMessage("Flyer guardado correctamente.");
      startTransition(() => router.refresh());
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error durante la subida del flyer.",
      );
    }
  }

  async function handleSaveMetadata() {
    if (!asset) {
      return;
    }

    setFeedbackMessage("Guardando descripción...");

    try {
      const response = await fetch(`/api/admin/colloquium-media/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: caption.trim() || null,
          altText: altText.trim() || `Flyer del coloquio ${colloquiumTitle}`,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(
          result.error ?? "No pudimos guardar la descripción del flyer.",
        );
      }

      setFeedbackMessage("Descripción guardada correctamente.");
      startTransition(() => router.refresh());
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al guardar la descripción.",
      );
    }
  }

  async function handleDelete() {
    if (!asset) {
      return;
    }

    setFeedbackMessage("Eliminando flyer...");

    try {
      const response = await fetch(`/api/admin/colloquium-media/${asset.id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "No pudimos eliminar el flyer.");
      }

      setFeedbackMessage("Flyer eliminado correctamente.");
      startTransition(() => router.refresh());
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al eliminar el flyer.",
      );
    }
  }

  return (
    <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_95%,white)] shadow-[0_18px_40px_rgba(31,26,23,0.05)]">
      <CardHeader>
        <CardTitle>Flyer del coloquio</CardTitle>
        <CardDescription>
          Añade una imagen opcional que se mostrará antes de la presentación.
          Formatos permitidos: JPEG, PNG, WebP y AVIF. Tamaño máximo:{" "}
          {formatMediaSizeLimit(maxSizeBytes)}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] xl:items-start">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="colloquium-flyer-file">Archivo del flyer</Label>
              <Input
                id="colloquium-flyer-file"
                type="file"
                accept={allowedMimeTypes.join(",")}
                className="h-12 cursor-pointer text-base"
                disabled={isPending}
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
                        : "No pudimos validar la imagen seleccionada.",
                    );
                  }
                }}
              />
            </div>

            <Button
              type="button"
              onClick={() => void handleUpload()}
              disabled={!selectedFile || isPending}
            >
              {isPending
                ? "Procesando..."
                : asset
                  ? "Reemplazar flyer"
                  : "Subir flyer"}
            </Button>
          </div>

          {asset?.signedUrl ? (
            <figure className="overflow-hidden rounded-[16px] border border-[var(--border-default)] bg-[var(--surface-subtle)] p-3 shadow-[0_12px_28px_rgba(31,26,23,0.06)]">
              <div
                className="flyer-stage min-h-48 rounded-[10px] p-2 sm:min-h-64"
                style={
                  {
                    "--flyer-stage-image": `url("${asset.signedUrl}")`,
                  } as CSSProperties
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.signedUrl}
                  alt={asset.altText ?? `Flyer del coloquio ${colloquiumTitle}`}
                  className="flyer-stage__image max-h-[28rem]"
                />
              </div>
              <figcaption className="px-2 pt-3 text-sm leading-6 text-[var(--text-secondary)]">
                Vista previa del flyer actual
              </figcaption>
            </figure>
          ) : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="colloquium-flyer-caption">
              Descripción del flyer
            </Label>
            <Textarea
              id="colloquium-flyer-caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              rows={3}
              className="text-base"
              placeholder="Describe brevemente la imagen para quienes la leen."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="colloquium-flyer-alt">Texto alternativo</Label>
            <Textarea
              id="colloquium-flyer-alt"
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              rows={3}
              className="text-base"
              placeholder={`Flyer del coloquio ${colloquiumTitle}`}
            />
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Ayuda a las personas que usan lectores de pantalla a entender la
              imagen.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {asset ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleSaveMetadata()}
                disabled={isPending}
              >
                Guardar descripción
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleDelete()}
                disabled={isPending}
              >
                Eliminar flyer
              </Button>
            </>
          ) : null}
        </div>

        <div aria-live="polite" className="space-y-2">
          {feedbackMessage ? (
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              {feedbackMessage}
            </p>
          ) : null}
          {!asset ? (
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Todavía no hay un flyer asociado. Este campo es opcional.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
