import "server-only";

import { isSupabaseColloquiumStorageConfigured } from "@/lib/env/server";
import { mapMediaAssetRows, signMediaAssets } from "@/lib/colloquiums/media";
import type {
  AdminColloquiumEditorRecord,
  AdminColloquiumListItem,
  BookOption,
  ColloquiumDetail,
  ColloquiumEntryRecord,
  ColloquiumSectionRecord,
  ColloquiumSummary,
  MediaAssetRecord,
} from "@/lib/colloquiums/types";
import { createClient } from "@/lib/supabase/server";

type ColloquiumRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: "draft" | "published";
  book_id: string;
  hero_image_asset_id: string | null;
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

type SectionRow = {
  id: string;
  colloquium_id: string;
  type: ColloquiumSectionRecord["type"];
  title: string | null;
  content: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

type EntryRow = {
  id: string;
  colloquium_id: string;
  section_id: string;
  type: ColloquiumEntryRecord["type"];
  role: ColloquiumEntryRecord["role"];
  label: string | null;
  participant_name: string | null;
  participant_location: string | null;
  central_idea: string | null;
  content: string | null;
  related_to_entry_id: string | null;
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
      "id, colloquium_id, section_id, entry_id, type, provider, bucket, storage_key, asset_path, mime_type, size_bytes, duration_seconds, title, caption, alt_text, display_order, created_at, updated_at",
    )
    .eq("colloquium_id", colloquiumId)
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
  heroImage: MediaAssetRecord | null,
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
    heroImage,
    publishedAt: colloquium.published_at,
  };
}

async function getColloquiumSectionsAndEntries(colloquiumId: string) {
  const supabase = await createClient();
  const [
    { data: sections, error: sectionsError },
    { data: entries, error: entriesError },
  ] = await Promise.all([
    supabase
      .from("colloquium_sections")
      .select(
        "id, colloquium_id, type, title, content, display_order, created_at, updated_at",
      )
      .eq("colloquium_id", colloquiumId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("colloquium_entries")
      .select(
        "id, colloquium_id, section_id, type, role, label, participant_name, participant_location, central_idea, content, related_to_entry_id, display_order, created_at, updated_at",
      )
      .eq("colloquium_id", colloquiumId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (sectionsError) {
    throw new Error(
      `Failed to load colloquium sections: ${sectionsError.message}`,
    );
  }

  if (entriesError) {
    throw new Error(
      `Failed to load colloquium entries: ${entriesError.message}`,
    );
  }

  return {
    sections: sections satisfies SectionRow[],
    entries: entries satisfies EntryRow[],
  };
}

function buildSectionTree(input: {
  sections: SectionRow[];
  entries: EntryRow[];
  assets: MediaAssetRecord[];
}): ColloquiumSectionRecord[] {
  const assetsBySectionId = new Map<string, MediaAssetRecord[]>();
  const assetsByEntryId = new Map<string, MediaAssetRecord[]>();

  input.assets.forEach((asset) => {
    if (asset.sectionId) {
      const sectionAssets = assetsBySectionId.get(asset.sectionId) ?? [];
      sectionAssets.push(asset);
      assetsBySectionId.set(asset.sectionId, sectionAssets);
    }

    if (asset.entryId) {
      const entryAssets = assetsByEntryId.get(asset.entryId) ?? [];
      entryAssets.push(asset);
      assetsByEntryId.set(asset.entryId, entryAssets);
    }
  });

  const entriesBySectionId = new Map<string, ColloquiumEntryRecord[]>();

  input.entries.forEach((entry) => {
    const sectionEntries = entriesBySectionId.get(entry.section_id) ?? [];
    sectionEntries.push({
      id: entry.id,
      colloquiumId: entry.colloquium_id,
      sectionId: entry.section_id,
      type: entry.type,
      role: entry.role,
      label: entry.label,
      participantName: entry.participant_name,
      participantLocation: entry.participant_location,
      centralIdea: entry.central_idea,
      content: entry.content,
      relatedToEntryId: entry.related_to_entry_id,
      displayOrder: entry.display_order,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
      assets: assetsByEntryId.get(entry.id) ?? [],
    });
    entriesBySectionId.set(entry.section_id, sectionEntries);
  });

  return input.sections.map((section) => ({
    id: section.id,
    colloquiumId: section.colloquium_id,
    type: section.type,
    title: section.title,
    content: section.content,
    displayOrder: section.display_order,
    createdAt: section.created_at,
    updatedAt: section.updated_at,
    assets: assetsBySectionId.get(section.id) ?? [],
    entries: entriesBySectionId.get(section.id) ?? [],
  }));
}

async function findColloquiumBySegment(
  segment: string,
  options?: { includeDrafts?: boolean },
) {
  const supabase = await createClient();

  let query = supabase
    .from("colloquiums")
    .select(
      "id, slug, title, excerpt, status, book_id, hero_image_asset_id, published_at, created_at, updated_at",
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
      "id, slug, title, excerpt, status, book_id, hero_image_asset_id, published_at, created_at, updated_at",
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
      "id, slug, title, excerpt, status, book_id, hero_image_asset_id, published_at, created_at, updated_at",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load colloquiums: ${error.message}`);
  }

  const booksById = await booksByIdPromise;
  const colloquiums = data satisfies ColloquiumRow[];

  if (colloquiums.length === 0) {
    return [];
  }

  const assetsByColloquium = new Map<string, MediaAssetRecord[]>();

  await Promise.all(
    colloquiums.map(async (colloquium) => {
      assetsByColloquium.set(
        colloquium.id,
        await fetchMediaAssetsForColloquium(colloquium.id),
      );
    }),
  );

  return colloquiums.map((colloquium) =>
    mapColloquiumSummary(
      colloquium,
      booksById,
      (assetsByColloquium.get(colloquium.id) ?? []).find(
        (asset) => asset.id === colloquium.hero_image_asset_id,
      ) ?? null,
    ),
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
  const { sections, entries } = await getColloquiumSectionsAndEntries(
    colloquium.id,
  );
  const summary = mapColloquiumSummary(
    colloquium,
    booksById,
    assets.find((asset) => asset.id === colloquium.hero_image_asset_id) ?? null,
  );

  return {
    ...summary,
    createdAt: colloquium.created_at,
    updatedAt: colloquium.updated_at,
    rootAssets: assets.filter((asset) => !asset.sectionId && !asset.entryId),
    sections: buildSectionTree({
      sections,
      entries,
      assets,
    }),
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
      "id, slug, title, excerpt, status, book_id, hero_image_asset_id, published_at, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load admin colloquiums: ${error.message}`);
  }

  const colloquiums = data satisfies ColloquiumRow[];
  if (colloquiums.length === 0) {
    return [];
  }

  const booksById = await booksByIdPromise;
  const assetsByColloquium = new Map<string, MediaAssetRecord[]>();

  await Promise.all(
    colloquiums.map(async (colloquium) => {
      assetsByColloquium.set(
        colloquium.id,
        await fetchMediaAssetsForColloquium(colloquium.id),
      );
    }),
  );

  const { data: sections, error: sectionsError } = await supabase
    .from("colloquium_sections")
    .select("id, colloquium_id")
    .in(
      "colloquium_id",
      colloquiums.length
        ? colloquiums.map((colloquium) => colloquium.id)
        : [""],
    );

  if (sectionsError) {
    throw new Error(
      `Failed to count colloquium sections: ${sectionsError.message}`,
    );
  }

  const sectionCounts = new Map<string, number>();

  (sections ?? []).forEach((section: { colloquium_id: string }) => {
    sectionCounts.set(
      section.colloquium_id,
      (sectionCounts.get(section.colloquium_id) ?? 0) + 1,
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
    heroImage:
      (assetsByColloquium.get(colloquium.id) ?? []).find(
        (asset) => asset.id === colloquium.hero_image_asset_id,
      ) ?? null,
    publishedAt: colloquium.published_at,
    createdAt: colloquium.created_at,
    updatedAt: colloquium.updated_at,
    sectionCount: sectionCounts.get(colloquium.id) ?? 0,
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
