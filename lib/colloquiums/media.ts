import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { requireAdmin } from "@/lib/auth/session";
import {
  getAllowedMimeTypes,
  getFileExtensionForMimeType,
  getMediaSizeLimit,
  MEDIA_READ_URL_TTL_SECONDS,
  MEDIA_UPLOAD_URL_TTL_SECONDS,
  normalizeMediaAssetType,
} from "@/lib/colloquiums/schemas";
import {
  createRandomStorageSuffix,
  createSignedReadUrl,
  createSignedUploadToken,
  deleteObjectFromStorage,
  getColloquiumMediaBucket,
} from "@/lib/colloquiums/storage";
import type {
  MediaAssetRecord,
  MediaAssetType,
  MediaUploadIntent,
  MediaUploadTokenPayload,
  PresignedUploadResult,
} from "@/lib/colloquiums/types";
import { getSupabaseServiceRoleKey } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";

type MediaAssetRow = {
  id: string;
  colloquium_id: string;
  section_id: string | null;
  type: MediaAssetType;
  provider: "supabase-storage";
  bucket: string;
  storage_key: string;
  asset_path: string;
  mime_type: string;
  size_bytes: number | null;
  duration_seconds: number | null;
  title: string | null;
  caption: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

function createUploadTokenSignature(payload: string): Buffer {
  return createHmac("sha256", getSupabaseServiceRoleKey())
    .update(payload)
    .digest();
}

function serializeUploadTokenPayload(payload: MediaUploadTokenPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function parseUploadTokenPayload(
  serializedPayload: string,
): MediaUploadTokenPayload {
  const parsedValue = JSON.parse(
    Buffer.from(serializedPayload, "base64url").toString("utf8"),
  ) as MediaUploadTokenPayload;

  return {
    colloquiumId: parsedValue.colloquiumId,
    sectionId: parsedValue.sectionId,
    assetType: normalizeMediaAssetType(parsedValue.assetType),
    storageKey: parsedValue.storageKey,
    mimeType: parsedValue.mimeType,
    sizeBytes: parsedValue.sizeBytes,
    expiresAt: parsedValue.expiresAt,
  };
}

function createUploadToken(payload: MediaUploadTokenPayload): string {
  const serializedPayload = serializeUploadTokenPayload(payload);
  const signature =
    createUploadTokenSignature(serializedPayload).toString("base64url");

  return `${serializedPayload}.${signature}`;
}

function verifyUploadToken(token: string): MediaUploadTokenPayload {
  const [serializedPayload, signature] = token.split(".");

  if (!serializedPayload || !signature) {
    throw new Error("Invalid upload token");
  }

  const expectedSignature = createUploadTokenSignature(serializedPayload);
  const providedSignature = Buffer.from(signature, "base64url");

  if (
    expectedSignature.length !== providedSignature.length ||
    !timingSafeEqual(expectedSignature, providedSignature)
  ) {
    throw new Error("Invalid upload token signature");
  }

  const payload = parseUploadTokenPayload(serializedPayload);

  if (new Date(payload.expiresAt) <= new Date()) {
    throw new Error("Upload token has expired");
  }

  return payload;
}

function mapMediaAssetRecord(row: MediaAssetRow): MediaAssetRecord {
  return {
    id: row.id,
    colloquiumId: row.colloquium_id,
    sectionId: row.section_id,
    type: row.type,
    provider: row.provider,
    bucket: row.bucket,
    storageKey: row.storage_key,
    assetPath: row.asset_path,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    durationSeconds: row.duration_seconds,
    title: row.title,
    caption: row.caption,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    signedUrl: null,
  };
}

export function validateMediaFile(input: MediaUploadIntent) {
  const assetType = normalizeMediaAssetType(input.assetType);
  const allowedMimeTypes = getAllowedMimeTypes(assetType);

  if (!allowedMimeTypes.includes(input.mimeType)) {
    throw new Error("Unsupported media type");
  }

  if (input.sizeBytes <= 0 || input.sizeBytes > getMediaSizeLimit(assetType)) {
    throw new Error("Media file exceeds the allowed size");
  }

  const extension = getFileExtensionForMimeType(input.mimeType);

  if (!input.sectionId.trim()) {
    throw new Error("Audio assets must belong to a presentation block");
  }

  return {
    assetType,
    extension,
  };
}

async function assertMediaContextExists(input: {
  colloquiumId: string;
  sectionId: string;
}) {
  const supabase = await createClient();

  const { data: colloquium, error: colloquiumError } = await supabase
    .from("colloquiums")
    .select("id, slug")
    .eq("id", input.colloquiumId)
    .maybeSingle<{ id: string; slug: string }>();

  if (colloquiumError) {
    throw new Error(
      `Failed to load colloquium context: ${colloquiumError.message}`,
    );
  }

  if (!colloquium) {
    throw new Error("Invalid colloquium context");
  }

  const { data: section, error: sectionError } = await supabase
    .from("colloquium_sections")
    .select("id, colloquium_id, type")
    .eq("id", input.sectionId)
    .maybeSingle<{ id: string; colloquium_id: string; type: string }>();

  if (sectionError) {
    throw new Error(`Failed to load section context: ${sectionError.message}`);
  }

  if (
    !section ||
    section.colloquium_id !== input.colloquiumId ||
    section.type !== "audio"
  ) {
    throw new Error("Invalid presentation block context");
  }

  return colloquium;
}

function createStorageKey(input: {
  colloquiumSlug: string;
  extension: string;
}) {
  return `colloquiums/${input.colloquiumSlug}/audio/${createRandomStorageSuffix()}.${input.extension}`;
}

export async function createColloquiumPresignedUpload(
  input: MediaUploadIntent,
): Promise<PresignedUploadResult> {
  await requireAdmin();

  const { assetType, extension } = validateMediaFile(input);
  const colloquium = await assertMediaContextExists({
    colloquiumId: input.colloquiumId,
    sectionId: input.sectionId,
  });
  const storageKey = createStorageKey({
    colloquiumSlug: colloquium.slug,
    extension,
  });
  const expiresAt = new Date(
    Date.now() + MEDIA_UPLOAD_URL_TTL_SECONDS * 1000,
  ).toISOString();
  const assetToken = createUploadToken({
    colloquiumId: input.colloquiumId,
    sectionId: input.sectionId,
    assetType,
    storageKey,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    expiresAt,
  });
  const uploadToken = await createSignedUploadToken({
    storageKey,
  });

  return {
    storageKey,
    uploadToken,
    assetToken,
    expiresAt,
  };
}

export async function confirmMediaUpload(input: {
  assetToken: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number | null;
}) {
  await requireAdmin();

  const payload = verifyUploadToken(input.assetToken);

  if (
    payload.storageKey !== input.storageKey ||
    payload.mimeType !== input.mimeType ||
    payload.sizeBytes !== input.sizeBytes
  ) {
    throw new Error("Upload confirmation does not match the original request");
  }

  await assertMediaContextExists({
    colloquiumId: payload.colloquiumId,
    sectionId: payload.sectionId,
  });

  const supabase = await createClient();
  const { data: currentAssets, error: currentAssetsError } = await supabase
    .from("media_assets")
    .select("id, storage_key")
    .eq("section_id", payload.sectionId)
    .eq("type", "audio");

  if (currentAssetsError) {
    throw new Error(
      `Failed to inspect existing block media: ${currentAssetsError.message}`,
    );
  }

  for (const asset of currentAssets ?? []) {
    await deleteObjectFromStorage(asset.storage_key);

    const { error: deleteError } = await supabase
      .from("media_assets")
      .delete()
      .eq("id", asset.id);

    if (deleteError) {
      throw new Error(`Failed to replace block audio: ${deleteError.message}`);
    }
  }

  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      colloquium_id: payload.colloquiumId,
      section_id: payload.sectionId,
      type: payload.assetType,
      provider: "supabase-storage",
      bucket: getColloquiumMediaBucket(),
      storage_key: payload.storageKey,
      asset_path: payload.storageKey,
      mime_type: payload.mimeType,
      size_bytes: payload.sizeBytes,
      duration_seconds: input.durationSeconds ?? null,
      title: null,
      caption: null,
      alt_text: null,
      display_order: 0,
    })
    .select(
      "id, colloquium_id, section_id, type, provider, bucket, storage_key, asset_path, mime_type, size_bytes, duration_seconds, title, caption, display_order, created_at, updated_at",
    )
    .maybeSingle<MediaAssetRow>();

  if (error) {
    throw new Error(`Failed to confirm media upload: ${error.message}`);
  }

  if (!data) {
    throw new Error("Media upload confirmation did not return a saved asset");
  }

  const signedReadUrl = await createSignedReadUrl({
    storageKey: data.storage_key,
    expiresInSeconds: MEDIA_READ_URL_TTL_SECONDS,
  });

  return {
    asset: {
      ...mapMediaAssetRecord(data),
      signedUrl: signedReadUrl,
    },
    status: "confirmed" as const,
  };
}

export async function deleteMediaAsset(input: { assetId: string }) {
  await requireAdmin();

  const supabase = await createClient();
  const { data: asset, error: selectError } = await supabase
    .from("media_assets")
    .select("id, storage_key")
    .eq("id", input.assetId)
    .maybeSingle<{ id: string; storage_key: string }>();

  if (selectError) {
    throw new Error(`Failed to load media asset: ${selectError.message}`);
  }

  if (!asset) {
    throw new Error("Media asset not found");
  }

  await deleteObjectFromStorage(asset.storage_key);

  const { error: deleteError } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", input.assetId);

  if (deleteError) {
    throw new Error(`Failed to delete media asset: ${deleteError.message}`);
  }
}

export async function signMediaAssets(assets: MediaAssetRecord[]) {
  return Promise.all(
    assets.map(async (asset) => ({
      ...asset,
      signedUrl: await createSignedReadUrl({
        storageKey: asset.storageKey,
        expiresInSeconds: MEDIA_READ_URL_TTL_SECONDS,
      }),
    })),
  );
}

export function mapMediaAssetRows(rows: MediaAssetRow[]) {
  return rows.map(mapMediaAssetRecord);
}
