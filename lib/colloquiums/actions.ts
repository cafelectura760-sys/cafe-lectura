"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addColloquiumEntry,
  addColloquiumSection,
  ColloquiumEditorError,
  createAdminColloquium,
  deleteColloquium,
  deleteColloquiumEntry,
  deleteColloquiumSection,
  moveColloquiumEntry,
  moveColloquiumSection,
  setColloquiumHeroImage,
  updateAdminColloquium,
  updateColloquiumEntry,
  updateColloquiumSection,
  updateColloquiumSlug,
  updateMediaAssetMetadata,
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
  redirect(`${path}?${key}=${encodeURIComponent(value)}`);
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

export async function addColloquiumSectionAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await addColloquiumSection({
      colloquiumId,
      type: getStringEntry(formData.get("type"), "invalid-section-type"),
      title: getOptionalStringEntry(formData.get("title")),
      content: getOptionalStringEntry(formData.get("content")),
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "section-created");
}

export async function updateColloquiumSectionAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await updateColloquiumSection({
      sectionId: getStringEntry(
        formData.get("section_id"),
        "section-not-found",
      ),
      colloquiumId,
      type: getStringEntry(formData.get("type"), "invalid-section-type"),
      title: getOptionalStringEntry(formData.get("title")),
      content: getOptionalStringEntry(formData.get("content")),
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "section-updated");
}

export async function deleteColloquiumSectionAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await deleteColloquiumSection({
      sectionId: getStringEntry(
        formData.get("section_id"),
        "section-not-found",
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
  redirectWithFeedback(redirectPath, "status", "section-deleted");
}

export async function moveColloquiumSectionAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await moveColloquiumSection({
      sectionId: getStringEntry(
        formData.get("section_id"),
        "section-not-found",
      ),
      colloquiumId,
      direction:
        getStringEntry(formData.get("direction"), "invalid-section-order") ===
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
  redirectWithFeedback(redirectPath, "status", "section-moved");
}

export async function addColloquiumEntryAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await addColloquiumEntry({
      colloquiumId,
      sectionId: getStringEntry(
        formData.get("section_id"),
        "section-not-found",
      ),
      type: getStringEntry(formData.get("type"), "invalid-entry-type"),
      role: getStringEntry(formData.get("role"), "invalid-entry-role"),
      label: getOptionalStringEntry(formData.get("label")),
      participantName: getOptionalStringEntry(formData.get("participant_name")),
      participantLocation: getOptionalStringEntry(
        formData.get("participant_location"),
      ),
      centralIdea: getOptionalStringEntry(formData.get("central_idea")),
      content: getOptionalStringEntry(formData.get("content")),
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "entry-created");
}

export async function updateColloquiumEntryAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await updateColloquiumEntry({
      entryId: getStringEntry(formData.get("entry_id"), "entry-not-found"),
      sectionId: getStringEntry(
        formData.get("section_id"),
        "section-not-found",
      ),
      type: getStringEntry(formData.get("type"), "invalid-entry-type"),
      role: getStringEntry(formData.get("role"), "invalid-entry-role"),
      label: getOptionalStringEntry(formData.get("label")),
      participantName: getOptionalStringEntry(formData.get("participant_name")),
      participantLocation: getOptionalStringEntry(
        formData.get("participant_location"),
      ),
      centralIdea: getOptionalStringEntry(formData.get("central_idea")),
      content: getOptionalStringEntry(formData.get("content")),
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "entry-updated");
}

export async function deleteColloquiumEntryAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await deleteColloquiumEntry({
      entryId: getStringEntry(formData.get("entry_id"), "entry-not-found"),
      sectionId: getStringEntry(
        formData.get("section_id"),
        "section-not-found",
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
  redirectWithFeedback(redirectPath, "status", "entry-deleted");
}

export async function moveColloquiumEntryAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await moveColloquiumEntry({
      entryId: getStringEntry(formData.get("entry_id"), "entry-not-found"),
      sectionId: getStringEntry(
        formData.get("section_id"),
        "section-not-found",
      ),
      direction:
        getStringEntry(formData.get("direction"), "invalid-entry-order") ===
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
  redirectWithFeedback(redirectPath, "status", "entry-moved");
}

export async function setColloquiumHeroImageAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await setColloquiumHeroImage({
      colloquiumId,
      assetId: getOptionalStringEntry(formData.get("asset_id")),
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "hero-updated");
}

export async function updateMediaAssetMetadataAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await updateMediaAssetMetadata({
      assetId: getStringEntry(formData.get("asset_id"), "invalid-media-asset"),
      title: getOptionalStringEntry(formData.get("title")),
      caption: getOptionalStringEntry(formData.get("caption")),
      altText: getOptionalStringEntry(formData.get("alt_text")),
      displayOrder: getOptionalStringEntry(formData.get("display_order")),
    });
  } catch (error) {
    handleEditorActionError(error, redirectPath);
  }

  revalidateColloquiumSurface({
    colloquiumId,
    currentSlug,
    nextSlug: currentSlug,
  });
  redirectWithFeedback(redirectPath, "status", "asset-updated");
}

export async function deleteColloquiumAction(formData: FormData) {
  const redirectPath = normalizeRedirectPath(formData.get("redirect_to"));
  const colloquiumId = getStringEntry(
    formData.get("colloquium_id"),
    "colloquium-not-found",
  );
  const currentSlug = getOptionalStringEntry(formData.get("current_slug"));

  try {
    await deleteColloquium({
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

  redirectWithFeedback("/admin", "status", "colloquium-deleted");
}
