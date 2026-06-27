import "server-only";

import { isSupabaseColloquiumStorageConfigured } from "@/lib/env/server";
import { mapMediaAssetRows, signMediaAssets } from "@/lib/colloquiums/media";
import type {
  AdminColloquiumEditorRecord,
  AdminColloquiumListItem,
  BookOption,
  ColloquiumDetail,
  ColloquiumParticipantRecord,
  ColloquiumSummary,
  MediaAssetRecord,
  PresentationAudioBlockRecord,
  PresentationBlockRecord,
  PresentationTextBlockRecord,
} from "@/lib/colloquiums/types";
import { createClient } from "@/lib/supabase/server";

type ColloquiumRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: "draft" | "published";
  book_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type BookLookupRow = {
  id: string;
  title: string;
  author: string;
  cover_image_url: string;
};

type ParticipantRow = {
  id: string;
  colloquium_id: string;
  name: string;
  role: ColloquiumParticipantRecord["role"];
  display_order: number;
  created_at: string;
  updated_at: string;
};

type PresentationBlockRow = {
  id: string;
  colloquium_id: string;
  type: PresentationBlockRecord["type"];
  title: string | null;
  content: string | null;
  participant_id: string | null;
  speaker_role: PresentationAudioBlockRecord["speakerRole"] | null;
  speaker_name: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

type MediaAssetRow = Parameters<typeof mapMediaAssetRows>[0][number];

async function getBooksLookup() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, cover_image_url");

  if (error) {
    throw new Error(`Failed to load colloquium books: ${error.message}`);
  }

  return new Map(
    (data satisfies BookLookupRow[]).map((book) => [
      book.id,
      {
        title: book.title,
        author: book.author,
        coverImageUrl: book.cover_image_url,
      },
    ]),
  );
}

async function fetchMediaAssetsForColloquium(
  colloquiumId: string,
): Promise<MediaAssetRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select(
      "id, colloquium_id, section_id, type, provider, bucket, storage_key, asset_path, mime_type, size_bytes, duration_seconds, title, caption, display_order, created_at, updated_at",
    )
    .eq("colloquium_id", colloquiumId)
    .eq("type", "audio")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load colloquium media assets: ${error.message}`);
  }

  const assets = mapMediaAssetRows(data satisfies MediaAssetRow[]);

  if (!assets.length || !isSupabaseColloquiumStorageConfigured()) {
    return assets;
  }

  return signMediaAssets(assets);
}

function mapColloquiumSummary(
  colloquium: ColloquiumRow,
  booksById: Map<
    string,
    {
      title: string;
      author: string;
      coverImageUrl: string;
    }
  >,
): ColloquiumSummary {
  const relatedBook = booksById.get(colloquium.book_id);

  return {
    id: colloquium.id,
    slug: colloquium.slug,
    title: colloquium.title,
    excerpt: colloquium.excerpt?.trim() || null,
    status: colloquium.status,
    bookId: colloquium.book_id,
    bookTitle: relatedBook?.title ?? "Libro no disponible",
    bookAuthor: relatedBook?.author ?? "Autor no disponible",
    bookCoverImageUrl: relatedBook?.coverImageUrl ?? "",
    publishedAt: colloquium.published_at,
  };
}

async function getColloquiumParticipants(
  colloquiumId: string,
): Promise<ColloquiumParticipantRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colloquium_participants")
    .select(
      "id, colloquium_id, name, role, display_order, created_at, updated_at",
    )
    .eq("colloquium_id", colloquiumId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load colloquium participants: ${error.message}`);
  }

  return (data satisfies ParticipantRow[]).map((participant) => ({
    id: participant.id,
    colloquiumId: participant.colloquium_id,
    name: participant.name,
    role: participant.role,
    displayOrder: participant.display_order,
    createdAt: participant.created_at,
    updatedAt: participant.updated_at,
  }));
}

async function getPresentationBlocks(
  colloquiumId: string,
  assets: MediaAssetRecord[],
): Promise<PresentationBlockRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colloquium_sections")
    .select(
      "id, colloquium_id, type, title, content, participant_id, speaker_role, speaker_name, display_order, created_at, updated_at",
    )
    .eq("colloquium_id", colloquiumId)
    .in("type", ["text", "audio"])
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load presentation blocks: ${error.message}`);
  }

  const assetsBySectionId = new Map<string, MediaAssetRecord>();

  assets.forEach((asset) => {
    if (asset.sectionId && !assetsBySectionId.has(asset.sectionId)) {
      assetsBySectionId.set(asset.sectionId, asset);
    }
  });

  return (data satisfies PresentationBlockRow[]).map((block) => {
    if (block.type === "text") {
      return {
        id: block.id,
        colloquiumId: block.colloquium_id,
        type: "text",
        content: block.content?.trim() || "",
        displayOrder: block.display_order,
        createdAt: block.created_at,
        updatedAt: block.updated_at,
      } satisfies PresentationTextBlockRecord;
    }

    return {
      id: block.id,
      colloquiumId: block.colloquium_id,
      type: "audio",
      label: block.title?.trim() || null,
      participantId: block.participant_id,
      speakerRole: block.speaker_role ?? "other",
      speakerName: block.speaker_name?.trim() || "Participación",
      asset: assetsBySectionId.get(block.id) ?? null,
      displayOrder: block.display_order,
      createdAt: block.created_at,
      updatedAt: block.updated_at,
    } satisfies PresentationAudioBlockRecord;
  });
}

async function findColloquiumBySegment(
  segment: string,
  options?: { includeDrafts?: boolean },
) {
  const supabase = await createClient();

  let query = supabase
    .from("colloquiums")
    .select(
      "id, slug, title, excerpt, status, book_id, published_at, created_at, updated_at",
    )
    .eq("slug", segment)
    .limit(1);

  if (!options?.includeDrafts) {
    query = query.eq("status", "published");
  }

  const { data: bySlug, error: bySlugError } =
    await query.maybeSingle<ColloquiumRow>();

  if (bySlugError) {
    throw new Error(`Failed to load colloquium detail: ${bySlugError.message}`);
  }

  if (bySlug) {
    return bySlug;
  }

  const isUuidLike = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(segment);

  if (!isUuidLike) {
    return null;
  }

  let byIdQuery = supabase
    .from("colloquiums")
    .select(
      "id, slug, title, excerpt, status, book_id, published_at, created_at, updated_at",
    )
    .eq("id", segment)
    .limit(1);

  if (!options?.includeDrafts) {
    byIdQuery = byIdQuery.eq("status", "published");
  }

  const { data: byId, error: byIdError } =
    await byIdQuery.maybeSingle<ColloquiumRow>();

  if (byIdError) {
    throw new Error(`Failed to load colloquium detail: ${byIdError.message}`);
  }

  return byId;
}

export async function getAvailableColloquiums(): Promise<ColloquiumSummary[]> {
  const supabase = await createClient();
  const booksByIdPromise = getBooksLookup();
  const { data, error } = await supabase
    .from("colloquiums")
    .select(
      "id, slug, title, excerpt, status, book_id, published_at, created_at, updated_at",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load colloquiums: ${error.message}`);
  }

  const booksById = await booksByIdPromise;
  const colloquiums = data satisfies ColloquiumRow[];

  return colloquiums.map((colloquium) =>
    mapColloquiumSummary(colloquium, booksById),
  );
}

export async function getColloquiumBySegment(
  segment: string,
  options?: { includeDrafts?: boolean },
): Promise<ColloquiumDetail | null> {
  const colloquium = await findColloquiumBySegment(segment, options);

  if (!colloquium) {
    return null;
  }

  const booksById = await getBooksLookup();
  const assets = await fetchMediaAssetsForColloquium(colloquium.id);
  const [participants, presentationBlocks] = await Promise.all([
    getColloquiumParticipants(colloquium.id),
    getPresentationBlocks(colloquium.id, assets),
  ]);
  const summary = mapColloquiumSummary(colloquium, booksById);

  return {
    ...summary,
    createdAt: colloquium.created_at,
    updatedAt: colloquium.updated_at,
    participants,
    presentationBlocks,
  };
}

export async function listAdminColloquiums(): Promise<
  AdminColloquiumListItem[]
> {
  const supabase = await createClient();
  const booksByIdPromise = getBooksLookup();
  const { data, error } = await supabase
    .from("colloquiums")
    .select(
      "id, slug, title, excerpt, status, book_id, published_at, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load admin colloquiums: ${error.message}`);
  }

  const colloquiums = data satisfies ColloquiumRow[];
  if (colloquiums.length === 0) {
    return [];
  }

  const colloquiumIds = colloquiums.map((colloquium) => colloquium.id);

  const [booksById, sectionsResult, participantsResult] = await Promise.all([
    booksByIdPromise,
    supabase
      .from("colloquium_sections")
      .select("colloquium_id, type")
      .in("colloquium_id", colloquiumIds)
      .in("type", ["text", "audio"]),
    supabase
      .from("colloquium_participants")
      .select("colloquium_id")
      .in("colloquium_id", colloquiumIds),
  ]);

  if (sectionsResult.error) {
    throw new Error(
      `Failed to count presentation blocks: ${sectionsResult.error.message}`,
    );
  }

  if (participantsResult.error) {
    throw new Error(
      `Failed to count colloquium participants: ${participantsResult.error.message}`,
    );
  }

  const blockCounts = new Map<string, number>();
  const audioBlockCounts = new Map<string, number>();
  const participantCounts = new Map<string, number>();

  (sectionsResult.data ?? []).forEach((section) => {
    blockCounts.set(
      section.colloquium_id,
      (blockCounts.get(section.colloquium_id) ?? 0) + 1,
    );

    if (section.type === "audio") {
      audioBlockCounts.set(
        section.colloquium_id,
        (audioBlockCounts.get(section.colloquium_id) ?? 0) + 1,
      );
    }
  });

  (participantsResult.data ?? []).forEach((participant) => {
    participantCounts.set(
      participant.colloquium_id,
      (participantCounts.get(participant.colloquium_id) ?? 0) + 1,
    );
  });

  return colloquiums.map((colloquium) => ({
    id: colloquium.id,
    slug: colloquium.slug,
    title: colloquium.title,
    excerpt: colloquium.excerpt?.trim() || null,
    status: colloquium.status,
    bookId: colloquium.book_id,
    bookTitle:
      booksById.get(colloquium.book_id)?.title ?? "Libro no disponible",
    publishedAt: colloquium.published_at,
    createdAt: colloquium.created_at,
    updatedAt: colloquium.updated_at,
    blockCount: blockCounts.get(colloquium.id) ?? 0,
    audioBlockCount: audioBlockCounts.get(colloquium.id) ?? 0,
    participantCount: participantCounts.get(colloquium.id) ?? 0,
  }));
}

export async function getAdminColloquiumEditorRecord(
  colloquiumId: string,
): Promise<AdminColloquiumEditorRecord | null> {
  return getColloquiumBySegment(colloquiumId, {
    includeDrafts: true,
  });
}

export async function listColloquiumBookOptions(): Promise<BookOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("id, title, author")
    .order("title", { ascending: true });

  if (error) {
    throw new Error(`Failed to load book options: ${error.message}`);
  }

  return (data satisfies BookOption[]).map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
  }));
}
