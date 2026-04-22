import { getWhatsAppDefaultMessage, getWhatsAppNumber } from "@/lib/env/public";

function normalizeWhatsAppNumber(value: string): string {
  return value.replace(/[^\d]/g, "");
}

export function createWhatsAppHref(contextMessage?: string): string {
  const number = normalizeWhatsAppNumber(getWhatsAppNumber());
  const defaultMessage = getWhatsAppDefaultMessage().trim();
  const message = contextMessage
    ? `${defaultMessage}\n\n${contextMessage.trim()}`
    : defaultMessage;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
