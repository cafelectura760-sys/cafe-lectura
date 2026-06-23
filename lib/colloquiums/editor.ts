import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import {
  createSlugCandidate,
  normalizeColloquiumEntryRole,
  normalizeColloquiumEntryType,
  normalizeColloquiumSectionType,
  normalizeColloquiumStatus,
  normalizeDisplayOrder,
  normalizeOptionalText,
  normalizePublishedDate,
  normalizeRequiredText,
  slugifyValue,
} from "@/lib/colloquiums/schemas";
import { deleteObjectFromStorage } from "@/lib/colloquiums/storage";
import type {
  ColloquiumSectionType,
  ColloquiumStatus,
} from "@/lib/colloquiums/types";
import { createClient } from "@/lib/supabase/server";

export type ColloquiumEditorErrorCode =
  | "invalid-colloquium-title"
  | "invalid-colloquium-slug"
  | "invalid-colloquium-status"
  | "invalid-colloquium-book-id"
  | "invalid-colloquium-published-at"
  | "published-colloquium-needs-sections"
  | "colloquium-not-found"
  | "slug-already-exists"
  | "invalid-section-type"
  | "invalid-section-content"
  | "invalid-section-order"
  | "section-not-found"
  | "invalid-entry-type"
  | "invalid-entry-role"
  | "invalid-entry-order"
  | "entry-not-found"
  | "invalid-media-asset";

type ColloquiumIdentityRow = {
  id: string;
  slug: string;
  status: ColloquiumStatus;
};

type ColloquiumOrderRow = {
  id: string;
  display_order: number;
};

type ExistingSectionRow = {
  id: string;
  type: ColloquiumSectionType;
  title: string | null;
  content: string | null;
};

type ColloquiumEditorInput = {
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  status: string;
  bookId: string;
  publishedAt?: string | null;
};

type SectionInput = {
  colloquiumId: string;
  type: string;
  title?: string | null;
  content?: string | null;
};

type EntryInput = {
  colloquiumId: string;
  sectionId: string;
  type: string;
  role: string;
  label?: string | null;
  participantName?: string | null;
  participantLocation?: string | null;
  centralIdea?: string | null;
  content?: string | null;
};

const TEXT_SECTION_TYPES = new Set<ColloquiumSectionType>([
  "intro",
  "content",
  "closing",
]);

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

function normalizeSectionText(input: Pick<SectionInput, "title" | "content">) {
  return {
    title: normalizeOptionalText(input.title),
    content: normalizeOptionalText(input.content),
  };
}

function isSectionValid(section: {
  type: ColloquiumSectionType;
  title: string | null;
  content: string | null;
}): boolean {
  if (!TEXT_SECTION_TYPES.has(section.type)) {
    return true;
  }

  return Boolean(section.title?.trim() || section.content?.trim());
}

function assertSectionContentRequirements(section: {
  type: ColloquiumSectionType;
  title: string | null;
  content: string | null;
}) {
  if (!TEXT_SECTION_TYPES.has(section.type)) {
    return;
  }

  if (!isSectionValid(section)) {
    throw new ColloquiumEditorError("invalid-section-content");
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

async function getNextSectionOrder(colloquiumId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colloquium_sections")
    .select("display_order")
    .eq("colloquium_id", colloquiumId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ display_order: number }>();

  if (error) {
    throw new Error(`Failed to load next section order: ${error.message}`);
  }

  return (data?.display_order ?? -1) + 1;
}

async function getNextEntryOrder(sectionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colloquium_entries")
    .select("display_order")
    .eq("section_id", sectionId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ display_order: number }>();

  if (error) {
    throw new Error(`Failed to load next entry order: ${error.message}`);
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

async function assertSectionExists(sectionId: string, colloquiumId?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colloquium_sections")
    .select("id, colloquium_id, display_order")
    .eq("id", sectionId)
    .maybeSingle<{
      id: string;
      colloquium_id: string;
      display_order: number;
    }>();

  if (error) {
    throw new Error(`Failed to load colloquium section: ${error.message}`);
  }

  if (!data || (colloquiumId && data.colloquium_id !== colloquiumId)) {
    throw new ColloquiumEditorError("section-not-found");
  }

  return data;
}

async function assertEntryExists(entryId: string, sectionId?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colloquium_entries")
    .select("id, section_id, display_order")
    .eq("id", entryId)
    .maybeSingle<{ id: string; section_id: string; display_order: number }>();

  if (error) {
    throw new Error(`Failed to load colloquium entry: ${error.message}`);
  }

  if (!data || (sectionId && data.section_id !== sectionId)) {
    throw new ColloquiumEditorError("entry-not-found");
  }

  return data;
}

async function moveOrderedRecord(input: {
  table: "colloquium_sections" | "colloquium_entries";
  id: string;
  scopeColumn: "colloquium_id" | "section_id";
  scopeId: string;
  direction: "up" | "down";
}) {
  const supabase = await createClient();
  const { data: currentRecord, error: currentRecordError } = await supabase
    .from(input.table)
    .select("id, display_order")
    .eq("id", input.id)
    .maybeSingle<ColloquiumOrderRow>();

  if (currentRecordError) {
    throw new Error(
      `Failed to load current ordered record: ${currentRecordError.message}`,
    );
  }

  if (!currentRecord) {
    throw new Error("Ordered record not found");
  }

  const ordering = input.direction === "up";
  let swapRecordQuery = supabase
    .from(input.table)
    .select("id, display_order")
    .eq(input.scopeColumn, input.scopeId);

  swapRecordQuery =
    input.direction === "up"
      ? swapRecordQuery.lt("display_order", currentRecord.display_order)
      : swapRecordQuery.gt("display_order", currentRecord.display_order);

  const { data: swapRecord, error: swapRecordError } = await swapRecordQuery
    .order("display_order", { ascending: ordering })
    .limit(1)
    .maybeSingle<ColloquiumOrderRow>();

  if (swapRecordError) {
    throw new Error(
      `Failed to load adjacent ordered record: ${swapRecordError.message}`,
    );
  }

  if (!swapRecord) {
    return;
  }

  const { error: currentUpdateError } = await supabase
    .from(input.table)
    .update({ display_order: swapRecord.display_order })
    .eq("id", currentRecord.id);

  if (currentUpdateError) {
    throw new Error(
      `Failed to move ordered record: ${currentUpdateError.message}`,
    );
  }

  const { error: swapUpdateError } = await supabase
    .from(input.table)
    .update({ display_order: currentRecord.display_order })
    .eq("id", swapRecord.id);

  if (swapUpdateError) {
    throw new Error(
      `Failed to move adjacent ordered record: ${swapUpdateError.message}`,
    );
  }
}

async function listSectionsForColloquium(colloquiumId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colloquium_sections")
    .select("id, type, title, content")
    .eq("colloquium_id", colloquiumId);

  if (error) {
    throw new Error(`Failed to load colloquium sections: ${error.message}`);
  }

  return data satisfies ExistingSectionRow[];
}

async function ensurePublishedColloquiumHasValidSections(
  colloquiumId: string,
  options?: {
    nextStatus?: ColloquiumStatus;
    nextSections?: ExistingSectionRow[];
  },
) {
  const colloquium = await assertColloquiumExists(colloquiumId);
  const targetStatus = options?.nextStatus ?? colloquium.status;

  if (targetStatus !== "published") {
    return;
  }

  const sections =
    options?.nextSections ?? (await listSectionsForColloquium(colloquiumId));

  if (!sections.some((section) => isSectionValid(section))) {
    throw new ColloquiumEditorError("published-colloquium-needs-sections");
  }
}

export async function createAdminColloquium(input: ColloquiumEditorInput) {
  await requireAdmin();

  const supabase = await createClient();
  const normalizedInput = normalizeColloquiumInput(input);

  if (normalizedInput.status === "published") {
    throw new ColloquiumEditorError("published-colloquium-needs-sections");
  }

  const slug = await resolveUniqueSlug({
    desiredSlug:
      normalizedInput.slugSource ?? createSlugCandidate(normalizedInput.title),
  });

  await assertBookExists(normalizedInput.bookId);

  const { data, error } = await supabase
    .from("colloquiums")
    .insert({
      title: normalizedInput.title,
      slug,
      excerpt: normalizedInput.excerpt,
      status: normalizedInput.status,
      book_id: normalizedInput.bookId,
      published_at: normalizedInput.publishedAt,
    })
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(`Failed to create colloquium: ${error.message}`);
  }

  if (!data) {
    throw new Error("Colloquium creation did not return a record");
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
  const existingColloquium = await assertColloquiumExists(colloquiumId);
  await assertBookExists(normalizedInput.bookId);

  const slug = await resolveUniqueSlug(
    {
      desiredSlug: normalizedInput.slugSource ?? existingColloquium.slug,
      existingColloquiumId: colloquiumId,
    },
    { allowExact: true },
  );

  await ensurePublishedColloquiumHasValidSections(colloquiumId, {
    nextStatus: normalizedInput.status,
  });

  const { error } = await supabase
    .from("colloquiums")
    .update({
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
    .eq("id", colloquiumId);

  if (error) {
    throw new Error(`Failed to update colloquium: ${error.message}`);
  }
}

export async function updateColloquiumSlug(input: {
  colloquiumId: string;
  slug: string;
}) {
  await requireAdmin();

  const supabase = await createClient();
  const colloquiumId = input.colloquiumId.trim();

  if (!colloquiumId) {
    throw new ColloquiumEditorError("colloquium-not-found");
  }

  await assertColloquiumExists(colloquiumId);

  const slug = await resolveUniqueSlug(
    {
      desiredSlug: input.slug,
      existingColloquiumId: colloquiumId,
    },
    { allowExact: true },
  );

  const { error } = await supabase
    .from("colloquiums")
    .update({ slug })
    .eq("id", colloquiumId);

  if (error) {
    throw new Error(`Failed to update colloquium slug: ${error.message}`);
  }
}

export async function addColloquiumSection(input: SectionInput) {
  await requireAdmin();

  const supabase = await createClient();
  const colloquiumId = input.colloquiumId.trim();
  const sectionType = normalizeColloquiumSectionType(input.type);

  if (!colloquiumId) {
    throw new ColloquiumEditorError("colloquium-not-found");
  }

  const normalizedSectionText = normalizeSectionText(input);
  assertSectionContentRequirements({
    type: sectionType,
    ...normalizedSectionText,
  });

  await assertColloquiumExists(colloquiumId);

  const { error } = await supabase.from("colloquium_sections").insert({
    colloquium_id: colloquiumId,
    type: sectionType,
    title: normalizedSectionText.title,
    content: normalizedSectionText.content,
    display_order: await getNextSectionOrder(colloquiumId),
  });

  if (error) {
    throw new Error(`Failed to add colloquium section: ${error.message}`);
  }
}

export async function updateColloquiumSection(input: {
  sectionId: string;
  colloquiumId: string;
  type: string;
  title?: string | null;
  content?: string | null;
}) {
  await requireAdmin();

  const supabase = await createClient();
  const sectionId = input.sectionId.trim();
  const colloquiumId = input.colloquiumId.trim();

  if (!sectionId || !colloquiumId) {
    throw new ColloquiumEditorError("section-not-found");
  }

  await assertSectionExists(sectionId, colloquiumId);

  const type = normalizeColloquiumSectionType(input.type);
  const normalizedSectionText = normalizeSectionText(input);
  assertSectionContentRequirements({
    type,
    ...normalizedSectionText,
  });

  const sections = await listSectionsForColloquium(colloquiumId);
  const nextSections = sections.map((section) =>
    section.id === sectionId
      ? {
          ...section,
          type,
          title: normalizedSectionText.title,
          content: normalizedSectionText.content,
        }
      : section,
  );

  await ensurePublishedColloquiumHasValidSections(colloquiumId, {
    nextSections,
  });

  const { error } = await supabase
    .from("colloquium_sections")
    .update({
      type,
      title: normalizedSectionText.title,
      content: normalizedSectionText.content,
    })
    .eq("id", sectionId);

  if (error) {
    throw new Error(`Failed to update colloquium section: ${error.message}`);
  }
}

export async function deleteColloquiumSection(input: {
  sectionId: string;
  colloquiumId: string;
}) {
  await requireAdmin();

  const sectionId = input.sectionId.trim();
  const colloquiumId = input.colloquiumId.trim();

  await assertSectionExists(sectionId, colloquiumId);

  const sections = await listSectionsForColloquium(colloquiumId);
  const nextSections = sections.filter((section) => section.id !== sectionId);

  await ensurePublishedColloquiumHasValidSections(colloquiumId, {
    nextSections,
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("colloquium_sections")
    .delete()
    .eq("id", sectionId);

  if (error) {
    throw new Error(`Failed to delete colloquium section: ${error.message}`);
  }
}

export async function moveColloquiumSection(input: {
  sectionId: string;
  colloquiumId: string;
  direction: "up" | "down";
}) {
  await requireAdmin();
  await assertSectionExists(input.sectionId.trim(), input.colloquiumId.trim());

  await moveOrderedRecord({
    table: "colloquium_sections",
    id: input.sectionId.trim(),
    scopeColumn: "colloquium_id",
    scopeId: input.colloquiumId.trim(),
    direction: input.direction,
  });
}

export async function addColloquiumEntry(input: EntryInput) {
  await requireAdmin();

  const supabase = await createClient();
  const colloquiumId = input.colloquiumId.trim();
  const sectionId = input.sectionId.trim();

  if (!colloquiumId) {
    throw new ColloquiumEditorError("colloquium-not-found");
  }

  if (!sectionId) {
    throw new ColloquiumEditorError("section-not-found");
  }

  await assertColloquiumExists(colloquiumId);
  await assertSectionExists(sectionId, colloquiumId);

  const { error } = await supabase.from("colloquium_entries").insert({
    colloquium_id: colloquiumId,
    section_id: sectionId,
    type: normalizeColloquiumEntryType(input.type),
    role: normalizeColloquiumEntryRole(input.role),
    label: normalizeOptionalText(input.label),
    participant_name: normalizeOptionalText(input.participantName),
    participant_location: normalizeOptionalText(input.participantLocation),
    central_idea: normalizeOptionalText(input.centralIdea),
    content: normalizeOptionalText(input.content),
    display_order: await getNextEntryOrder(sectionId),
  });

  if (error) {
    throw new Error(`Failed to add colloquium entry: ${error.message}`);
  }
}

export async function updateColloquiumEntry(input: {
  entryId: string;
  sectionId: string;
  type: string;
  role: string;
  label?: string | null;
  participantName?: string | null;
  participantLocation?: string | null;
  centralIdea?: string | null;
  content?: string | null;
}) {
  await requireAdmin();

  const supabase = await createClient();
  const entryId = input.entryId.trim();
  const sectionId = input.sectionId.trim();

  if (!entryId || !sectionId) {
    throw new ColloquiumEditorError("entry-not-found");
  }

  await assertEntryExists(entryId, sectionId);

  const { error } = await supabase
    .from("colloquium_entries")
    .update({
      type: normalizeColloquiumEntryType(input.type),
      role: normalizeColloquiumEntryRole(input.role),
      label: normalizeOptionalText(input.label),
      participant_name: normalizeOptionalText(input.participantName),
      participant_location: normalizeOptionalText(input.participantLocation),
      central_idea: normalizeOptionalText(input.centralIdea),
      content: normalizeOptionalText(input.content),
    })
    .eq("id", entryId);

  if (error) {
    throw new Error(`Failed to update colloquium entry: ${error.message}`);
  }
}

export async function deleteColloquiumEntry(input: {
  entryId: string;
  sectionId: string;
}) {
  await requireAdmin();

  const supabase = await createClient();
  await assertEntryExists(input.entryId.trim(), input.sectionId.trim());

  const { error } = await supabase
    .from("colloquium_entries")
    .delete()
    .eq("id", input.entryId.trim());

  if (error) {
    throw new Error(`Failed to delete colloquium entry: ${error.message}`);
  }
}

export async function moveColloquiumEntry(input: {
  entryId: string;
  sectionId: string;
  direction: "up" | "down";
}) {
  await requireAdmin();
  await assertEntryExists(input.entryId.trim(), input.sectionId.trim());

  await moveOrderedRecord({
    table: "colloquium_entries",
    id: input.entryId.trim(),
    scopeColumn: "section_id",
    scopeId: input.sectionId.trim(),
    direction: input.direction,
  });
}

export async function updateMediaAssetMetadata(input: {
  assetId: string;
  title?: string | null;
  caption?: string | null;
  altText?: string | null;
  displayOrder?: string | number | null;
}) {
  await requireAdmin();

  const supabase = await createClient();
  const assetId = input.assetId.trim();

  if (!assetId) {
    throw new ColloquiumEditorError("invalid-media-asset");
  }

  const { data: asset, error: assetError } = await supabase
    .from("media_assets")
    .select("id")
    .eq("id", assetId)
    .maybeSingle<{ id: string }>();

  if (assetError) {
    throw new Error(`Failed to load media asset: ${assetError.message}`);
  }

  if (!asset) {
    throw new ColloquiumEditorError("invalid-media-asset");
  }

  const { error } = await supabase
    .from("media_assets")
    .update({
      title: normalizeOptionalText(input.title),
      caption: normalizeOptionalText(input.caption),
      alt_text: normalizeOptionalText(input.altText),
      display_order:
        input.displayOrder === null || input.displayOrder === undefined
          ? undefined
          : normalizeDisplayOrder(input.displayOrder),
    })
    .eq("id", assetId);

  if (error) {
    throw new Error(`Failed to update media asset metadata: ${error.message}`);
  }
}

export async function setColloquiumHeroImage(input: {
  colloquiumId: string;
  assetId: string | null;
}) {
  await requireAdmin();

  const supabase = await createClient();
  const colloquiumId = input.colloquiumId.trim();

  if (!colloquiumId) {
    throw new ColloquiumEditorError("colloquium-not-found");
  }

  await assertColloquiumExists(colloquiumId);

  if (input.assetId) {
    const { data: asset, error: assetError } = await supabase
      .from("media_assets")
      .select("id, colloquium_id, type, section_id, entry_id")
      .eq("id", input.assetId)
      .maybeSingle<{
        id: string;
        colloquium_id: string;
        type: string;
        section_id: string | null;
        entry_id: string | null;
      }>();

    if (assetError) {
      throw new Error(`Failed to load hero image asset: ${assetError.message}`);
    }

    if (
      !asset ||
      asset.colloquium_id !== colloquiumId ||
      asset.type !== "image" ||
      asset.section_id !== null ||
      asset.entry_id !== null
    ) {
      throw new ColloquiumEditorError("invalid-media-asset");
    }
  }

  const { error } = await supabase
    .from("colloquiums")
    .update({
      hero_image_asset_id: input.assetId,
    })
    .eq("id", colloquiumId);

  if (error) {
    throw new Error(`Failed to set colloquium hero image: ${error.message}`);
  }
}

export async function deleteColloquium(input: { colloquiumId: string }) {
  await requireAdmin();

  const supabase = await createClient();
  const colloquiumId = input.colloquiumId.trim();

  if (!colloquiumId) {
    throw new ColloquiumEditorError("colloquium-not-found");
  }

  await assertColloquiumExists(colloquiumId);

  const { data: assets, error: assetsError } = await supabase
    .from("media_assets")
    .select("id, storage_key")
    .eq("colloquium_id", colloquiumId);

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
    .eq("id", colloquiumId);

  if (error) {
    throw new Error(`Failed to delete colloquium: ${error.message}`);
  }
}
