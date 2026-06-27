type RequiredPublicEnvName =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_WHATSAPP_NUMBER"
  | "NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE";

const requiredPublicEnv: Record<RequiredPublicEnvName, string | undefined> = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE:
    process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE,
};

function getRequiredPublicEnv(name: RequiredPublicEnvName): string {
  const value = requiredPublicEnv[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseUrl(): string {
  return getRequiredPublicEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabasePublishableKey(): string {
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!publishableKey) {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return publishableKey;
}

export function getWhatsAppNumber(): string {
  return getRequiredPublicEnv("NEXT_PUBLIC_WHATSAPP_NUMBER");
}

export function getWhatsAppDefaultMessage(): string {
  return getRequiredPublicEnv("NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE");
}
