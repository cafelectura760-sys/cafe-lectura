import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import {
  createSlugCandidate,
  normalizeColloquiumStatus,
  normalizeOptionalText,
  normalizeParticipantRole,
  normalizePublishedDate,
  normalizeRequiredText,
  slugifyValue,
} from "@/lib/colloquiums/schemas";
import { deleteObjectFromStorage } from "@/lib/colloquiums/storage";
import type {
  ColloquiumParticipantRole,
  ColloquiumStatus,
  PresentationBlockType,
} from "@/lib/colloquiums/types";
import { createClient } from "@/lib/supabase/server";

export type ColloquiumEditorErrorCode =
  | "invalid-colloquium-title"
  | "invalid-colloquium-slug"
  | "invalid-colloquium-status"
  | "invalid-colloquium-book-id"
  | "invalid-colloquium-published-at"
  | "published-colloquium-needs-audio"
  | "colloquium-not-found"
  | "slug-already-exists"
  | "invalid-participant-name"
  | "invalid-participant-role"
  | "participant-not-found"
  | "invalid-block-type"
  | "invalid-text-block-content"
  | "invalid-audio-speaker-name"
  | "invalid-audio-speaker-role"
  | "invalid-block-order"
  | "block-not-found"
  | "invalid-media-asset";

type ColloquiumIdentityRow = {
  id: string;
  slug: string;
  status: ColloquiumStatus;
};

type OrderedRow = {
  id: string;
  display_order: number;
};

type ColloquiumEditorInput = {
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  status: string;
  bookId: string;
  publishedAt?: string | null;
};

type ParticipantInput = {
  colloquiumId: string;
  name: string;
  role: string;
};

type PresentationTextBlockInput = {
  colloquiumId: string;
  content: string;
};

type PresentationAudioBlockInput = {
  colloquiumId: string;
  label?: string | null;
  participantId?: string | null;
  speakerName?: string | null;
  speakerRole?: string | null;
};

export class ColloquiumEditorError extends Error {
  constructor(public readonly code: ColloquiumEditorErrorCode) {
    super(code);
    this.name = "ColloquiumEditorError";
  }
}

function normalizeSlug(value: string): string {
  const normalizedValue = slugifyValue(value);

  if (!normalizedValue) {
    throw new ColloquiumEditorError("invalid-colloquium-slug");
  }

  return normalizedValue;
}

function parsePublishedAtToIso(value?: string | null): string | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    return normalizePublishedDate(value);
  } catch {
    throw new ColloquiumEditorError("invalid-colloquium-published-at");
  }
}

async function assertBookExists(bookId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("id")
    .eq("id", bookId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(`Failed to load related book: ${error.message}`);
  }

  if (!data) {
    throw new ColloquiumEditorError("invalid-colloquium-book-id");
  }
}

async function resolveUniqueSlug(
  input: {
    desiredSlug: string;
    existingColloquiumId?: string;
  },
  options?: { allowExact?: boolean },
) {
  const supabase = await createClient();
  let candidateSlug = normalizeSlug(input.desiredSlug);
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("colloquiums")
      .select("id, slug")
      .eq("slug", candidateSlug)
      .maybeSingle<{ id: string; slug: string }>();

    if (error) {
      throw new Error(`Failed to validate colloquium slug: ${error.message}`);
    }

    if (!data || data.id === input.existingColloquiumId) {
      return candidateSlug;
    }

    if (options?.allowExact) {
      throw new ColloquiumEditorError("slug-already-exists");
    }

    candidateSlug = `${normalizeSlug(input.desiredSlug)}-${suffix}`;
    suffix += 1;
  }
}

function normalizeColloquiumInput(input: ColloquiumEditorInput) {
  const title = normalizeRequiredText(input.title, "colloquium title");
  const status = normalizeColloquiumStatus(input.status);
  const bookId = input.bookId.trim();

  if (!bookId) {
    throw new ColloquiumEditorError("invalid-colloquium-book-id");
  }

  return {
    title,
    slugSource: normalizeOptionalText(input.slug),
    excerpt: normalizeOptionalText(input.excerpt),
    status,
    bookId,
    publishedAt: parsePublishedAtToIso(input.publishedAt),
  };
}

function normalizeParticipantInput(input: ParticipantInput) {
  const colloquiumId = input.colloquiumId.trim();
  const name = normalizeOptionalText(input.name);

  if (!colloquiumId) {
    throw new ColloquiumEditorError("colloquium-not-found");
  }

  if (!name) {
    throw new ColloquiumEditorError("invalid-participant-name");
  }

  try {
    return {
      colloquiumId,
      name,
      role: normalizeParticipantRole(input.role),
    };
  } catch {
    throw new ColloquiumEditorError("invalid-participant-role");
  }
}

async function getNextDisplayOrder(
  table: "colloquium_participants" | "colloquium_sections",
  colloquiumId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select("display_order")
    .eq("colloquium_id", colloquiumId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ display_order: number }>();

  if (error) {
    throw new Error(`Failed to load next display order: ${error.message}`);
  }

  return (data?.display_order ?? -1) + 1;
}

async function assertColloquiumExists(colloquiumId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colloquiums")
    .select("id, slug, status")
    .eq("id", colloquiumId)
    .maybeSingle<ColloquiumIdentityRow>();

  if (error) {
    throw new Error(`Failed to load colloquium: ${error.message}`);
  }

  if (!data) {
    throw new ColloquiumEditorError("colloquium-not-found");
  }

  return data;
}

async function assertParticipantExists(
  participantId: string,
  colloquiumId?: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colloquium_participants")
    .select("id, colloquium_id, name, role")
    .eq("id", participantId)
    .maybeSingle<{
      id: string;
      colloquium_id: string;
      name: string;
      role: ColloquiumParticipantRole;
    }>();

  if (error) {
    throw new Error(`Failed to load colloquium participant: ${error.message}`);
  }

  if (!data || (colloquiumId && data.colloquium_id !== colloquiumId)) {
    throw new ColloquiumEditorError("participant-not-found");
  }

  return data;
}

async function assertPresentationBlockExists(
  blockId: string,
  colloquiumId?: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colloquium_sections")
    .select("id, colloquium_id, type")
    .eq("id", blockId)
    .maybeSingle<{
      id: string;
      colloquium_id: string;
      type: PresentationBlockType | "qa" | "image";
    }>();

  if (error) {
    throw new Error(`Failed to load presentation block: ${error.message}`);
  }

  if (
    !data ||
    (colloquiumId && data.colloquium_id !== colloquiumId) ||
    (data.type !== "text" && data.type !== "audio")
  ) {
    throw new ColloquiumEditorError("block-not-found");
  }

  return data;
}

async function moveOrderedRecord(input: {
  table: "colloquium_participants" | "colloquium_sections";
  id: string;
  colloquiumId: string;
  direction: "up" | "down";
}) {
  const supabase = await createClient();
  const { data: records, error } = await supabase
    .from(input.table)
    .select("id, display_order")
    .eq("colloquium_id", input.colloquiumId)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load ordered records: ${error.message}`);
  }

  const orderedRecords = records satisfies OrderedRow[];
  const currentIndex = orderedRecords.findIndex(
    (record) => record.id === input.id,
  );

  if (currentIndex === -1) {
    throw new ColloquiumEditorError("invalid-block-order");
  }

  const swapIndex =
    input.direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (swapIndex < 0 || swapIndex >= orderedRecords.length) {
    return;
  }

  const currentRecord = orderedRecords[currentIndex];
  const swapRecord = orderedRecords[swapIndex];

  const { error: firstUpdateError } = await supabase
    .from(input.table)
    .update({
      display_order: swapRecord.display_order,
    })
    .eq("id", currentRecord.id);

  if (firstUpdateError) {
    throw new Error(
      `Failed to move ordered record: ${firstUpdateError.message}`,
    );
  }

  const { error: secondUpdateError } = await supabase
    .from(input.table)
    .update({
      display_order: currentRecord.display_order,
    })
    .eq("id", swapRecord.id);

  if (secondUpdateError) {
    throw new Error(
      `Failed to move ordered record: ${secondUpdateError.message}`,
    );
  }
}

async function deleteMediaAssetsForSection(sectionId: string) {
  const supabase = await createClient();
  const { data: assets, error } = await supabase
    .from("media_assets")
    .select("id, storage_key")
    .eq("section_id", sectionId)
    .eq("type", "audio");

  if (error) {
    throw new Error(`Failed to load section media assets: ${error.message}`);
  }

  for (const asset of assets ?? []) {
    await deleteObjectFromStorage(asset.storage_key);

    const { error: deleteError } = await supabase
      .from("media_assets")
      .delete()
      .eq("id", asset.id);

    if (deleteError) {
      throw new Error(
        `Failed to delete section media asset: ${deleteError.message}`,
      );
    }
  }
}

async function countPublishableAudioBlocks(colloquiumId: string) {
  const supabase = await createClient();
  const { data: blocks, error: blocksError } = await supabase
    .from("colloquium_sections")
    .select("id")
    .eq("colloquium_id", colloquiumId)
    .eq("type", "audio");

  if (blocksError) {
    throw new Error(
      `Failed to inspect colloquium audio blocks: ${blocksError.message}`,
    );
  }

  const audioBlockIds = (blocks ?? []).map((block: { id: string }) => block.id);

  if (audioBlockIds.length === 0) {
    return 0;
  }

  const { data: assets, error: assetsError } = await supabase
    .from("media_assets")
    .select("section_id")
    .eq("colloquium_id", colloquiumId)
    .eq("type", "audio")
    .in("section_id", audioBlockIds);

  if (assetsError) {
    throw new Error(
      `Failed to inspect colloquium audio assets: ${assetsError.message}`,
    );
  }

  return new Set(
    (assets ?? [])
      .map((asset: { section_id: string | null }) => asset.section_id)
      .filter((sectionId): sectionId is string => Boolean(sectionId)),
  ).size;
}

async function ensurePublishedColloquiumHasAudio(colloquiumId: string) {
  const publishableAudioBlockCount =
    await countPublishableAudioBlocks(colloquiumId);

  if (publishableAudioBlockCount === 0) {
    throw new ColloquiumEditorError("published-colloquium-needs-audio");
  }
}

async function resolveAudioSpeaker(input: {
  colloquiumId: string;
  participantId?: string | null;
  speakerName?: string | null;
  speakerRole?: string | null;
}) {
  const participantId = input.participantId?.trim();

  if (participantId) {
    const participant = await assertParticipantExists(
      participantId,
      input.colloquiumId,
    );

    return {
      participantId: participant.id,
      speakerName: participant.name,
      speakerRole: participant.role,
    };
  }

  const speakerName = normalizeOptionalText(input.speakerName);

  if (!speakerName) {
    throw new ColloquiumEditorError("invalid-audio-speaker-name");
  }

  try {
    return {
      participantId: null,
      speakerName,
      speakerRole: normalizeParticipantRole(input.speakerRole ?? ""),
    };
  } catch {
    throw new ColloquiumEditorError("invalid-audio-speaker-role");
  }
}

export async function createAdminColloquium(input: ColloquiumEditorInput) {
  await requireAdmin();

  const supabase = await createClient();
  const normalizedInput = normalizeColloquiumInput(input);
  await assertBookExists(normalizedInput.bookId);
  const slug = await resolveUniqueSlug({
    desiredSlug:
      normalizedInput.slugSource ?? createSlugCandidate(normalizedInput.title),
  });

  const { data, error } = await supabase
    .from("colloquiums")
    .insert({
      title: normalizedInput.title,
      slug,
      excerpt: normalizedInput.excerpt,
      status: normalizedInput.status,
      book_id: normalizedInput.bookId,
      published_at:
        normalizedInput.status === "published"
          ? (normalizedInput.publishedAt ?? new Date().toISOString())
          : normalizedInput.publishedAt,
    })
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    if (error.message.includes('column "content"')) {
      throw new Error(
        "Failed to create colloquium: the Supabase schema is outdated and still requires the legacy public.colloquiums.content column. Apply the colloquium recovery migration before creating new records.",
      );
    }

    throw new Error(`Failed to create colloquium: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to return the created colloquium");
  }

  if (normalizedInput.status === "published") {
    await ensurePublishedColloquiumHasAudio(data.id);
  }

  return data.id;
}

export async function updateAdminColloquium(
  colloquiumId: string,
  input: ColloquiumEditorInput,
) {
  await requireAdmin();

  const supabase = await createClient();
  const normalizedInput = normalizeColloquiumInput(input);
  const colloquium = await assertColloquiumExists(colloquiumId.trim());
  await assertBookExists(normalizedInput.bookId);

  const { error } = await supabase
    .from("colloquiums")
    .update({
      title: normalizedInput.title,
      excerpt: normalizedInput.excerpt,
      status: normalizedInput.status,
      book_id: normalizedInput.bookId,
      published_at:
        normalizedInput.status === "published"
          ? (normalizedInput.publishedAt ?? new Date().toISOString())
          : normalizedInput.publishedAt,
    })
    .eq("id", colloquium.id);

  if (error) {
    throw new Error(`Failed to update colloquium: ${error.message}`);
  }

  if (normalizedInput.status === "published") {
    await ensurePublishedColloquiumHasAudio(colloquium.id);
  }
}

export async function updateColloquiumSlug(input: {
  colloquiumId: string;
  slug: string;
}) {
  await requireAdmin();

  const supabase = await createClient();
  const colloquium = await assertColloquiumExists(input.colloquiumId.trim());
  const slug = await resolveUniqueSlug(
    {
      desiredSlug: input.slug,
      existingColloquiumId: colloquium.id,
    },
    { allowExact: true },
  );

  const { error } = await supabase
    .from("colloquiums")
    .update({ slug })
    .eq("id", colloquium.id);

  if (error) {
    throw new Error(`Failed to update colloquium slug: ${error.message}`);
  }
}

export async function addColloquiumParticipant(input: ParticipantInput) {
  await requireAdmin();

  const supabase = await createClient();
  const normalizedInput = normalizeParticipantInput(input);
  await assertColloquiumExists(normalizedInput.colloquiumId);

  const { error } = await supabase.from("colloquium_participants").insert({
    colloquium_id: normalizedInput.colloquiumId,
    name: normalizedInput.name,
    role: normalizedInput.role,
    display_order: await getNextDisplayOrder(
      "colloquium_participants",
      normalizedInput.colloquiumId,
    ),
  });

  if (error) {
    throw new Error(`Failed to add colloquium participant: ${error.message}`);
  }
}

export async function updateColloquiumParticipant(input: {
  participantId: string;
  colloquiumId: string;
  name: string;
  role: string;
}) {
  await requireAdmin();

  const normalizedInput = normalizeParticipantInput({
    colloquiumId: input.colloquiumId,
    name: input.name,
    role: input.role,
  });
  await assertParticipantExists(
    input.participantId.trim(),
    normalizedInput.colloquiumId,
  );

  const supabase = await createClient();
  const { error } = await supabase
    .from("colloquium_participants")
    .update({
      name: normalizedInput.name,
      role: normalizedInput.role,
    })
    .eq("id", input.participantId.trim());

  if (error) {
    throw new Error(
      `Failed to update colloquium participant: ${error.message}`,
    );
  }
}

export async function deleteColloquiumParticipant(input: {
  participantId: string;
  colloquiumId: string;
}) {
  await requireAdmin();

  await assertParticipantExists(
    input.participantId.trim(),
    input.colloquiumId.trim(),
  );

  const supabase = await createClient();
  const { error: resetBlocksError } = await supabase
    .from("colloquium_sections")
    .update({
      participant_id: null,
    })
    .eq("participant_id", input.participantId.trim());

  if (resetBlocksError) {
    throw new Error(
      `Failed to detach participant from blocks: ${resetBlocksError.message}`,
    );
  }

  const { error } = await supabase
    .from("colloquium_participants")
    .delete()
    .eq("id", input.participantId.trim());

  if (error) {
    throw new Error(
      `Failed to delete colloquium participant: ${error.message}`,
    );
  }
}

export async function moveColloquiumParticipant(input: {
  participantId: string;
  colloquiumId: string;
  direction: "up" | "down";
}) {
  await requireAdmin();

  await assertParticipantExists(
    input.participantId.trim(),
    input.colloquiumId.trim(),
  );
  await moveOrderedRecord({
    table: "colloquium_participants",
    id: input.participantId.trim(),
    colloquiumId: input.colloquiumId.trim(),
    direction: input.direction,
  });
}

export async function addPresentationTextBlock(
  input: PresentationTextBlockInput,
) {
  await requireAdmin();

  const colloquiumId = input.colloquiumId.trim();
  const content = normalizeOptionalText(input.content);

  if (!colloquiumId) {
    throw new ColloquiumEditorError("colloquium-not-found");
  }

  if (!content) {
    throw new ColloquiumEditorError("invalid-text-block-content");
  }

  await assertColloquiumExists(colloquiumId);

  const supabase = await createClient();
  const { error } = await supabase.from("colloquium_sections").insert({
    colloquium_id: colloquiumId,
    type: "text",
    title: null,
    content,
    participant_id: null,
    speaker_role: null,
    speaker_name: null,
    display_order: await getNextDisplayOrder(
      "colloquium_sections",
      colloquiumId,
    ),
  });

  if (error) {
    throw new Error(`Failed to add presentation text block: ${error.message}`);
  }
}

export async function updatePresentationTextBlock(input: {
  blockId: string;
  colloquiumId: string;
  content: string;
}) {
  await requireAdmin();

  const blockId = input.blockId.trim();
  const colloquiumId = input.colloquiumId.trim();
  const content = normalizeOptionalText(input.content);

  if (!blockId || !colloquiumId) {
    throw new ColloquiumEditorError("block-not-found");
  }

  if (!content) {
    throw new ColloquiumEditorError("invalid-text-block-content");
  }

  await assertPresentationBlockExists(blockId, colloquiumId);

  const supabase = await createClient();
  const { error } = await supabase
    .from("colloquium_sections")
    .update({
      content,
      title: null,
      participant_id: null,
      speaker_role: null,
      speaker_name: null,
    })
    .eq("id", blockId)
    .eq("type", "text");

  if (error) {
    throw new Error(
      `Failed to update presentation text block: ${error.message}`,
    );
  }
}

export async function addPresentationAudioBlock(
  input: PresentationAudioBlockInput,
) {
  await requireAdmin();

  const colloquiumId = input.colloquiumId.trim();

  if (!colloquiumId) {
    throw new ColloquiumEditorError("colloquium-not-found");
  }

  await assertColloquiumExists(colloquiumId);
  const speaker = await resolveAudioSpeaker({
    colloquiumId,
    participantId: input.participantId,
    speakerName: input.speakerName,
    speakerRole: input.speakerRole,
  });

  const supabase = await createClient();
  const { error } = await supabase.from("colloquium_sections").insert({
    colloquium_id: colloquiumId,
    type: "audio",
    title: normalizeOptionalText(input.label),
    content: null,
    participant_id: speaker.participantId,
    speaker_role: speaker.speakerRole,
    speaker_name: speaker.speakerName,
    display_order: await getNextDisplayOrder(
      "colloquium_sections",
      colloquiumId,
    ),
  });

  if (error) {
    throw new Error(`Failed to add presentation audio block: ${error.message}`);
  }
}

export async function updatePresentationAudioBlock(input: {
  blockId: string;
  colloquiumId: string;
  label?: string | null;
  participantId?: string | null;
  speakerName?: string | null;
  speakerRole?: string | null;
}) {
  await requireAdmin();

  const blockId = input.blockId.trim();
  const colloquiumId = input.colloquiumId.trim();

  if (!blockId || !colloquiumId) {
    throw new ColloquiumEditorError("block-not-found");
  }

  await assertPresentationBlockExists(blockId, colloquiumId);
  const speaker = await resolveAudioSpeaker({
    colloquiumId,
    participantId: input.participantId,
    speakerName: input.speakerName,
    speakerRole: input.speakerRole,
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("colloquium_sections")
    .update({
      title: normalizeOptionalText(input.label),
      content: null,
      participant_id: speaker.participantId,
      speaker_role: speaker.speakerRole,
      speaker_name: speaker.speakerName,
    })
    .eq("id", blockId)
    .eq("type", "audio");

  if (error) {
    throw new Error(
      `Failed to update presentation audio block: ${error.message}`,
    );
  }
}

export async function deletePresentationBlock(input: {
  blockId: string;
  colloquiumId: string;
}) {
  await requireAdmin();

  const blockId = input.blockId.trim();
  const colloquiumId = input.colloquiumId.trim();
  await assertPresentationBlockExists(blockId, colloquiumId);
  await deleteMediaAssetsForSection(blockId);

  const supabase = await createClient();
  const { error } = await supabase
    .from("colloquium_sections")
    .delete()
    .eq("id", blockId);

  if (error) {
    throw new Error(`Failed to delete presentation block: ${error.message}`);
  }
}

export async function movePresentationBlock(input: {
  blockId: string;
  colloquiumId: string;
  direction: "up" | "down";
}) {
  await requireAdmin();

  await assertPresentationBlockExists(
    input.blockId.trim(),
    input.colloquiumId.trim(),
  );
  await moveOrderedRecord({
    table: "colloquium_sections",
    id: input.blockId.trim(),
    colloquiumId: input.colloquiumId.trim(),
    direction: input.direction,
  });
}

export async function deleteColloquium(input: { colloquiumId: string }) {
  await requireAdmin();

  const colloquium = await assertColloquiumExists(input.colloquiumId.trim());
  const supabase = await createClient();
  const { data: assets, error: assetsError } = await supabase
    .from("media_assets")
    .select("id, storage_key")
    .eq("colloquium_id", colloquium.id);

  if (assetsError) {
    throw new Error(
      `Failed to load colloquium media assets: ${assetsError.message}`,
    );
  }

  for (const asset of assets ?? []) {
    await deleteObjectFromStorage(asset.storage_key);
  }

  const { error } = await supabase
    .from("colloquiums")
    .delete()
    .eq("id", colloquium.id);

  if (error) {
    throw new Error(`Failed to delete colloquium: ${error.message}`);
  }
}
