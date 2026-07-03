export type ColloquiumEditorFeedback = {
  tone: "success" | "error";
  message: string;
};

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
  "presentation-saved": "Los cambios de la presentación fueron guardados.",
};

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
  "unexpected-error":
    "Ocurrió un error inesperado mientras se actualizaba el coloquio.",
};

export function getColloquiumEditorStatusMessage(
  status: string | null,
): string | null {
  if (!status) {
    return null;
  }

  return successMessages[status] ?? null;
}

export function getColloquiumEditorErrorMessage(
  error: string | null,
): string | null {
  if (!error) {
    return null;
  }

  return errorMessages[error] ?? errorMessages["unexpected-error"];
}

export function getColloquiumEditorFeedbackMessage(
  searchParams: Record<string, string | string[] | undefined>,
): ColloquiumEditorFeedback | null {
  const statusValue = searchParams.status;
  const errorValue = searchParams.error;
  const status = typeof statusValue === "string" ? statusValue : null;
  const error = typeof errorValue === "string" ? errorValue : null;

  const statusMessage = getColloquiumEditorStatusMessage(status);

  if (statusMessage) {
    return {
      tone: "success",
      message: statusMessage,
    };
  }

  if (!error) {
    return null;
  }

  return {
    tone: "error",
    message:
      getColloquiumEditorErrorMessage(error) ??
      errorMessages["unexpected-error"],
  };
}
