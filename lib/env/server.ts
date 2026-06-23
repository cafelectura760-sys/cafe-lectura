import "server-only";

import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/env/public";

function getRequiredServerEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export { getSupabasePublishableKey, getSupabaseUrl };

export function getSupabaseServiceRoleKey(): string {
  return getRequiredServerEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function getCronSecret(): string {
  return getRequiredServerEnv("CRON_SECRET");
}

export function getSupabaseColloquiumMediaBucket(): string {
  return getRequiredServerEnv("SUPABASE_COLLOQUIUM_MEDIA_BUCKET");
}

export function isSupabaseColloquiumStorageConfigured(): boolean {
  return [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_COLLOQUIUM_MEDIA_BUCKET",
  ].every((name) => Boolean(process.env[name]));
}
