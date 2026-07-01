export type ColloquiumStatus = "draft" | "published";

export type ColloquiumParticipantRole =
  | "host"
  | "presenter"
  | "guest"
  | "other";

export type PresentationBlockType = "text" | "audio";

export type MediaAssetType = "audio";

export type BookOption = {
  id: string;
  title: string;
  author: string;
};

export type MediaAssetRecord = {
  id: string;
  colloquiumId: string;
  sectionId: string | null;
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
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  signedUrl: string | null;
};

export type ColloquiumParticipantRecord = {
  id: string;
  colloquiumId: string;
  name: string;
  role: ColloquiumParticipantRole;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

type PresentationBlockBase = {
  id: string;
  colloquiumId: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PresentationTextBlockRecord = PresentationBlockBase & {
  type: "text";
  content: string;
};

export type PresentationAudioBlockRecord = PresentationBlockBase & {
  type: "audio";
  label: string | null;
  participantId: string | null;
  speakerRole: ColloquiumParticipantRole;
  speakerName: string;
  asset: MediaAssetRecord | null;
};

export type PresentationBlockRecord =
  | PresentationTextBlockRecord
  | PresentationAudioBlockRecord;

export type PresentationTextBlockDraft = {
  clientId: string;
  id: string | null;
  type: "text";
  content: string;
};

export type PresentationAudioBlockDraft = {
  clientId: string;
  id: string | null;
  type: "audio";
  label: string | null;
  participantId: string | null;
  speakerRole: ColloquiumParticipantRole;
  speakerName: string;
};

export type PresentationBlockDraft =
  | PresentationTextBlockDraft
  | PresentationAudioBlockDraft;

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
  publishedAt: string | null;
};

export type ColloquiumDetail = ColloquiumSummary & {
  createdAt: string;
  updatedAt: string;
  participants: ColloquiumParticipantRecord[];
  presentationBlocks: PresentationBlockRecord[];
};

export type AdminColloquiumListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: ColloquiumStatus;
  bookId: string;
  bookTitle: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  blockCount: number;
  audioBlockCount: number;
  participantCount: number;
};

export type AdminColloquiumEditorRecord = ColloquiumDetail;

export type ColloquiumFormState = {
  error: string | null;
};

export type MediaUploadIntent = {
  colloquiumId: string;
  sectionId: string;
  assetType: MediaAssetType;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type MediaUploadTokenPayload = {
  colloquiumId: string;
  sectionId: string;
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
