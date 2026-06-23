export type ColloquiumStatus = "draft" | "published";

export type ColloquiumSectionType =
  | "intro"
  | "content"
  | "audio"
  | "image"
  | "qa"
  | "closing";

export type ColloquiumEntryRole =
  | "reader"
  | "host"
  | "presenter"
  | "anonymous"
  | "other";

export type ColloquiumEntryType =
  | "question"
  | "answer"
  | "contribution"
  | "comment"
  | "central_idea"
  | "closing"
  | "other";

export type MediaAssetType = "image" | "audio";

export type BookOption = {
  id: string;
  title: string;
  author: string;
};

export type MediaAssetRecord = {
  id: string;
  colloquiumId: string;
  sectionId: string | null;
  entryId: string | null;
  type: MediaAssetType;
  provider: "supabase-storage";
  bucket: string;
  storageKey: string;
  assetPath: string;
  mimeType: string;
  sizeBytes: number | null;
  durationSeconds: number | null;
  title: string | null;
  caption: string | null;
  altText: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  signedUrl: string | null;
};

export type ColloquiumEntryRecord = {
  id: string;
  colloquiumId: string;
  sectionId: string;
  type: ColloquiumEntryType;
  role: ColloquiumEntryRole;
  label: string | null;
  participantName: string | null;
  participantLocation: string | null;
  centralIdea: string | null;
  content: string | null;
  relatedToEntryId: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  assets: MediaAssetRecord[];
};

export type ColloquiumSectionRecord = {
  id: string;
  colloquiumId: string;
  type: ColloquiumSectionType;
  title: string | null;
  content: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  assets: MediaAssetRecord[];
  entries: ColloquiumEntryRecord[];
};

export type ColloquiumSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: ColloquiumStatus;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverImageUrl: string;
  heroImage: MediaAssetRecord | null;
  publishedAt: string | null;
};

export type ColloquiumDetail = ColloquiumSummary & {
  createdAt: string;
  updatedAt: string;
  rootAssets: MediaAssetRecord[];
  sections: ColloquiumSectionRecord[];
};

export type AdminColloquiumListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: ColloquiumStatus;
  bookId: string;
  bookTitle: string;
  heroImage: MediaAssetRecord | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sectionCount: number;
};

export type AdminColloquiumEditorRecord = ColloquiumDetail;

export type ColloquiumFormState = {
  error: string | null;
};

export type MediaUploadIntent = {
  colloquiumId: string;
  sectionId?: string | null;
  entryId?: string | null;
  assetType: MediaAssetType;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type MediaUploadTokenPayload = {
  colloquiumId: string;
  sectionId: string | null;
  entryId: string | null;
  assetType: MediaAssetType;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  expiresAt: string;
};

export type PresignedUploadResult = {
  storageKey: string;
  uploadToken: string;
  assetToken: string;
  expiresAt: string;
};
