import "server-only";

import { randomUUID } from "node:crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseColloquiumMediaBucket } from "@/lib/env/server";

export function getColloquiumMediaBucket(): string {
  return getSupabaseColloquiumMediaBucket();
}

function getStorageBucketApi() {
  return createAdminClient().storage.from(getColloquiumMediaBucket());
}

export async function createSignedUploadToken(input: {
  storageKey: string;
}): Promise<string> {
  const { data, error } = await getStorageBucketApi().createSignedUploadUrl(
    input.storageKey,
  );

  if (error || !data?.token) {
    throw new Error(
      error?.message ?? "Failed to create the signed upload token",
    );
  }

  return data.token;
}

export async function createSignedReadUrl(input: {
  storageKey: string;
  expiresInSeconds: number;
}): Promise<string> {
  const { data, error } = await getStorageBucketApi().createSignedUrl(
    input.storageKey,
    input.expiresInSeconds,
  );

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to create the signed read URL");
  }

  return data.signedUrl;
}

export async function deleteObjectFromStorage(storageKey: string) {
  const { error } = await getStorageBucketApi().remove([storageKey]);

  if (error) {
    throw new Error(`Failed to delete the storage object: ${error.message}`);
  }
}

export function createRandomStorageSuffix(): string {
  return randomUUID();
}
