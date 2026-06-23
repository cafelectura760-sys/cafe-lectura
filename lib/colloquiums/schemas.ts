import type {
  ColloquiumEntryRole,
  ColloquiumEntryType,
  ColloquiumSectionType,
  ColloquiumStatus,
  MediaAssetType,
} from "@/lib/colloquiums/types";

export const COLLOQUIUM_STATUS_VALUES = ["draft", "published"] as const;
export const COLLOQUIUM_SECTION_TYPE_VALUES = [
  "intro",
  "content",
  "audio",
  "image",
  "qa",
  "closing",
] as const;
export const COLLOQUIUM_ENTRY_TYPE_VALUES = [
  "question",
  "answer",
  "contribution",
  "comment",
  "central_idea",
  "closing",
  "other",
] as const;
export const COLLOQUIUM_ENTRY_ROLE_VALUES = [
  "reader",
  "host",
  "presenter",
  "anonymous",
  "other",
] as const;
export const MEDIA_ASSET_TYPE_VALUES = ["image", "audio"] as const;

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp4",
  "audio/aac",
  "audio/ogg",
] as const;

export const IMAGE_EXTENSIONS_BY_MIME: Record<
  (typeof IMAGE_MIME_TYPES)[number],
  string
> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
export const AUDIO_EXTENSIONS_BY_MIME: Record<
  (typeof AUDIO_MIME_TYPES)[number],
  string
> = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
};

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_AUDIO_SIZE_BYTES = 45 * 1024 * 1024;
export const MEDIA_UPLOAD_URL_TTL_SECONDS = 5 * 60;
export const MEDIA_READ_URL_TTL_SECONDS = 15 * 60;

export function formatMediaSizeLimit(sizeBytes: number): string {
  return `${Math.floor(sizeBytes / (1024 * 1024))} MB`;
}

export function normalizeRequiredText(
  value: string,
  fieldName: string,
): string {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return normalizedValue;
}

export function normalizeOptionalText(
  value: string | null | undefined,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : null;
}

export function normalizeDisplayOrder(
  value: string | number | null | undefined,
): number {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number.parseInt(value, 10);

    if (Number.isInteger(parsedValue) && parsedValue >= 0) {
      return parsedValue;
    }
  }

  throw new Error("Invalid display order");
}

export function normalizeColloquiumStatus(value: string): ColloquiumStatus {
  if ((COLLOQUIUM_STATUS_VALUES as readonly string[]).includes(value)) {
    return value as ColloquiumStatus;
  }

  throw new Error("Invalid colloquium status");
}

export function normalizeColloquiumSectionType(
  value: string,
): ColloquiumSectionType {
  if ((COLLOQUIUM_SECTION_TYPE_VALUES as readonly string[]).includes(value)) {
    return value as ColloquiumSectionType;
  }

  throw new Error("Invalid colloquium section type");
}

export function normalizeColloquiumEntryType(
  value: string,
): ColloquiumEntryType {
  if ((COLLOQUIUM_ENTRY_TYPE_VALUES as readonly string[]).includes(value)) {
    return value as ColloquiumEntryType;
  }

  throw new Error("Invalid colloquium entry type");
}

export function normalizeColloquiumEntryRole(
  value: string,
): ColloquiumEntryRole {
  if ((COLLOQUIUM_ENTRY_ROLE_VALUES as readonly string[]).includes(value)) {
    return value as ColloquiumEntryRole;
  }

  throw new Error("Invalid colloquium entry role");
}

export function normalizeMediaAssetType(value: string): MediaAssetType {
  if ((MEDIA_ASSET_TYPE_VALUES as readonly string[]).includes(value)) {
    return value as MediaAssetType;
  }

  throw new Error("Invalid media asset type");
}

export function slugifyValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

export function createSlugCandidate(title: string): string {
  const baseSlug = slugifyValue(title);
  return baseSlug || "coloquio";
}

export function normalizePublishedDate(
  value: string | null | undefined,
): string {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return "";
  }

  const match = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    throw new Error("Invalid published date");
  }

  const [, year, month, day] = match;
  const utcDate = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0),
  );

  if (Number.isNaN(utcDate.getTime())) {
    throw new Error("Invalid published date");
  }

  return utcDate.toISOString();
}

export function getPublishedDateInputValue(isoDate: string | null): string {
  if (!isoDate) {
    return "";
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getFileExtensionForMimeType(mimeType: string): string {
  if (mimeType in IMAGE_EXTENSIONS_BY_MIME) {
    return IMAGE_EXTENSIONS_BY_MIME[
      mimeType as keyof typeof IMAGE_EXTENSIONS_BY_MIME
    ];
  }

  if (mimeType in AUDIO_EXTENSIONS_BY_MIME) {
    return AUDIO_EXTENSIONS_BY_MIME[
      mimeType as keyof typeof AUDIO_EXTENSIONS_BY_MIME
    ];
  }

  throw new Error("Unsupported MIME type");
}

export function getMediaSizeLimit(assetType: MediaAssetType): number {
  return assetType === "image" ? MAX_IMAGE_SIZE_BYTES : MAX_AUDIO_SIZE_BYTES;
}

export function getAllowedMimeTypes(
  assetType: MediaAssetType,
): readonly string[] {
  return assetType === "image" ? IMAGE_MIME_TYPES : AUDIO_MIME_TYPES;
}

export function shouldCollapseIntervention(content: string): boolean {
  const normalizedContent = content.trim();

  if (!normalizedContent) {
    return false;
  }

  const wordCount = normalizedContent.split(/\s+/).length;
  return normalizedContent.length > 500 || wordCount > 125;
}
