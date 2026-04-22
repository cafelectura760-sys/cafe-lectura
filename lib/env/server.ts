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
