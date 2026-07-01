"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addColloquiumParticipant,
  addPresentationAudioBlock,
  addPresentationTextBlock,
  ColloquiumEditorError,
  createAdminColloquium,
  deleteColloquium,
  deleteColloquiumParticipant,
  deletePresentationBlock,
  moveColloquiumParticipant,
  movePresentationBlock,
  updateAdminColloquium,
  updateColloquiumParticipant,
  updateColloquiumSlug,
  updatePresentationAudioBlock,
  updatePresentationTextBlock,
} from "@/lib/colloquiums/editor";

function getStringEntry(
  value: FormDataEntryValue | null,
  fallbackErrorCode: string,
): string {
  if (typeof value !== "string") {
    throw new ColloquiumEditorError(fallbackErrorCode as never);
  }

  return value;
}

function getOptionalStringEntry(
  value: FormDataEntryValue | null,
): string | null {
  return typeof value === "string" ? value : null;
}

function redirectWithFeedback(
  path: string,
  key: "status" | "error",
  value: string,
): never {
  const url = new URL(path, "http://localhost");
  url.searchParams.set(key, value);
  redirect(`${url.pathname}${url.search}`);
}

function normalizeRedirectPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/admin";
  }

  return value;
}

function handleEditorActionError(error: unknown, path: string): never {
  if (error instanceof ColloquiumEditorError) {
    redirectWithFeedback(path, "error", error.code);
  }

  throw error;
}

function revalidateColloquiumSurface(input: {
  colloquiumId?: string;
  currentSlug?: string | null;
  nextSlug?: string | null;
}) {
  revalidatePath("/admin");
  revalidatePath("/admin/colloquiums");
  revalidatePath("/colloquiums");

  if (input.colloquiumId) {
    revalidatePath(`/admin/colloquiums/${input.colloquiumId}`);
    revalidatePath(`/admin/colloquiums/${input.colloquiumId}/preview`);
  }

  if (input.currentSlug) {
    revalidatePath(`/colloquiums/${input.currentSlug}`);
  }

  if (input.nextSlug && input.nextSlug !== input.currentSlug) {
    revalidatePath(`/colloquiums/${input.nextSlug}`);
  }
}

export async function createColloquiumAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));

  try {
    const colloquiumId = await createAdminColloquium({
      title: getStringEntry(formData.get("title"), "invalid-colloquium-title"),
      slug: getOptionalStringEntry(formData.get("slug")),
      excerpt: getOptionalStringEntry(formData.get("excerpt")),
      status: getStringEntry(
        formData.get("status"),
        "invalid-colloquium-status",
      ),
      bookId: getStringEntry(
        formData.get("book_id"),
        "invalid-colloquium-book-id",
      ),
      publishedAt: getOptionalStringEntry(formData.get("published_at")),
    });

    revalidatePath("/admin");
    revalidatePath("/colloquiums");
    redirect(`/admin/colloquiums/${colloquiumId}?status=colloquium-created`);
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }
}

export async function updateColloquiumMetadataAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await updateAdminColloquium(colloquiumId, {
      title: getStringEntry(formData.get("title"), "invalid-colloquium-title"),
      excerpt: getOptionalStringEntry(formData.get("excerpt")),
      status: getStringEntry(
        formData.get("status"),
        "invalid-colloquium-status",
      ),
      bookId: getStringEntry(
        formData.get("book_id"),
        "invalid-colloquium-book-id",
      ),
      publishedAt: getOptionalStringEntry(formData.get("published_at")),
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "colloquium-updated");
}

export async function updateColloquiumSlugAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));
  const requestedSlug = getStringEntry(
    formData.get("slug"),
    "invalid-colloquium-slug",
  );

  try {
    await updateColloquiumSlug({
      colloquiumId,
      slug: requestedSlug,
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: requestedSlug,
  });
  redirectWithFeedback(redirectPath, "status", "colloquium-slug-updated");
}

export async function addColloquiumParticipantAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await addColloquiumParticipant({
      colloquiumId,
      name: getStringEntry(formData.get("name"), "invalid-participant-name"),
      role: getStringEntry(formData.get("role"), "invalid-participant-role"),
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "participant-created");
}

export async function updateColloquiumParticipantAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await updateColloquiumParticipant({
      participantId: getStringEntry(
        formData.get("participant_id"),
        "participant-not-found",
      ),
      colloquiumId,
      name: getStringEntry(formData.get("name"), "invalid-participant-name"),
      role: getStringEntry(formData.get("role"), "invalid-participant-role"),
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "participant-updated");
}

export async function deleteColloquiumParticipantAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await deleteColloquiumParticipant({
      participantId: getStringEntry(
        formData.get("participant_id"),
        "participant-not-found",
      ),
      colloquiumId,
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "participant-deleted");
}

export async function moveColloquiumParticipantAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await moveColloquiumParticipant({
      participantId: getStringEntry(
        formData.get("participant_id"),
        "participant-not-found",
      ),
      colloquiumId,
      direction:
        getStringEntry(formData.get("direction"), "invalid-block-order") ===
        "up"
          ? "up"
          : "down",
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "participant-moved");
}

export async function addPresentationTextBlockAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await addPresentationTextBlock({
      colloquiumId,
      content: getStringEntry(
        formData.get("content"),
        "invalid-text-block-content",
      ),
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "text-block-created");
}

export async function updatePresentationTextBlockAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await updatePresentationTextBlock({
      blockId: getStringEntry(formData.get("block_id"), "block-not-found"),
      colloquiumId,
      content: getStringEntry(
        formData.get("content"),
        "invalid-text-block-content",
      ),
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "text-block-updated");
}

export async function addPresentationAudioBlockAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await addPresentationAudioBlock({
      colloquiumId,
      label: getOptionalStringEntry(formData.get("label")),
      participantId: getOptionalStringEntry(formData.get("participant_id")),
      speakerName: getOptionalStringEntry(formData.get("speaker_name")),
      speakerRole: getOptionalStringEntry(formData.get("speaker_role")),
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "audio-block-created");
}

export async function updatePresentationAudioBlockAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await updatePresentationAudioBlock({
      blockId: getStringEntry(formData.get("block_id"), "block-not-found"),
      colloquiumId,
      label: getOptionalStringEntry(formData.get("label")),
      participantId: getOptionalStringEntry(formData.get("participant_id")),
      speakerName: getOptionalStringEntry(formData.get("speaker_name")),
      speakerRole: getOptionalStringEntry(formData.get("speaker_role")),
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "audio-block-updated");
}

export async function deletePresentationBlockAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await deletePresentationBlock({
      blockId: getStringEntry(formData.get("block_id"), "block-not-found"),
      colloquiumId,
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "block-deleted");
}

export async function movePresentationBlockAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await movePresentationBlock({
      blockId: getStringEntry(formData.get("block_id"), "block-not-found"),
      colloquiumId,
      direction:
        getStringEntry(formData.get("direction"), "invalid-block-order") ===
        "up"
          ? "up"
          : "down",
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "block-moved");
}

export async function deleteColloquiumAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );

  try {
    await deleteColloquium({ colloquiumId });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "colloquium-deleted");
}
