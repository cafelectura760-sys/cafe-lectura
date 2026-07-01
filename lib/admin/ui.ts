import type { KeepAliveStatus } from "@/lib/supabase/keepalive";

export type AdminFeedback = {
  tone: "success" | "error";
  message: string;
};

export function getSearchParamValue(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return null;
}

export function getAdminFeedbackMessage(
  searchParams: Record<string, string | string[] | undefined>,
): AdminFeedback | null {
  const status = getSearchParamValue(searchParams.status);
  const error = getSearchParamValue(searchParams.error);

  const successMessages: Record<string, string> = {
    "member-created":
      "La cuenta fue creada correctamente y ya tiene perfil dentro del sistema.",
    "member-updated":
      "La configuración del miembro fue actualizada correctamente.",
    "membership-extended":
      "La membresía fue extendida por un año a partir de la fecha vigente o de hoy.",
    "book-created":
      "El libro fue creado correctamente y ya forma parte del catálogo interno.",
    "book-updated":
      "Los datos del libro fueron actualizados y ya están disponibles en el sistema.",
    "colloquium-deleted":
      "El coloquio fue eliminado por completo, junto con sus archivos privados asociados.",
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
    "invalid-full-name": "Debes indicar un nombre completo válido.",
    "invalid-email": "Debes indicar un correo electrónico válido.",
    "invalid-password":
      "La contraseña debe tener al menos 8 caracteres para crear la cuenta.",
    "invalid-role": "El rol recibido no es válido.",
    "invalid-membership-date":
      "La fecha de membresía no es válida. Usa una fecha del calendario.",
    "email-already-exists":
      "Ya existe una cuenta con ese correo electrónico en Supabase Auth.",
    "member-not-found": "No pudimos encontrar el miembro solicitado.",
    "cannot-demote-yourself":
      "No puedes quitarte a ti mismo el rol de administrador desde este panel.",
    "invalid-book-title": "Debes indicar un título de libro válido.",
    "invalid-book-author": "Debes indicar un autor válido.",
    "invalid-book-synopsis": "Debes indicar una sinopsis válida para el libro.",
    "invalid-book-cover-image-url":
      "La portada debe ser una URL válida con protocolo http o https.",
    "book-not-found": "No pudimos encontrar el libro solicitado.",
  };

  return {
    tone: "error",
    message:
      errorMessages[error] ??
      "Ocurrió un error inesperado durante la operación administrativa.",
  };
}

export function formatDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "medium",
  }).format(new Date(isoDate));
}

export function formatDateTimeLabel(isoDate: string | null): string {
  if (!isoDate) {
    return "Nunca";
  }

  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

export function getKeepAliveStatusLabel(
  status: KeepAliveStatus["lastStatus"],
): string {
  switch (status) {
    case "success":
      return "Activo";
    case "error":
      return "Con error";
    case "missing":
      return "Sin registro";
  }
}

export function getKeepAliveTone(
  status: KeepAliveStatus,
): "success" | "warning" | "error" {
  if (status.lastStatus === "error") {
    return "error";
  }

  if (status.isStale) {
    return "warning";
  }

  return "success";
}
