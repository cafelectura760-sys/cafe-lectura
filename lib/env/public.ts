function getRequiredPublicEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseUrl(): string {
  return getRequiredPublicEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabasePublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    (() => {
      throw new Error(
        "Missing required environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      );
    })()
  );
}

export function getWhatsAppNumber(): string {
  return getRequiredPublicEnv("NEXT_PUBLIC_WHATSAPP_NUMBER");
}

export function getWhatsAppDefaultMessage(): string {
  return getRequiredPublicEnv("NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE");
}
