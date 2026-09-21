import { getWhatsAppNumber } from "@/lib/env/public";

function normalizeWhatsAppNumber(value: string): string {
  return value.replace(/[^\d]/g, "");
}

export function createWhatsAppHref(contextMessage: string): string {
  const number = normalizeWhatsAppNumber(getWhatsAppNumber());
  const message = contextMessage.trim();

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
