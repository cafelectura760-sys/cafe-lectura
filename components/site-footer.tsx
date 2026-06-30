import Link from "next/link";
import { MessageCircleMore } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { createWhatsAppHref } from "@/lib/whatsapp";

export function SiteFooter() {
  const whatsappHref = createWhatsAppHref(
    "Quiero comunicarme con Cafe Lectura por WhatsApp.",
  );

  return (
    <footer className="site-footer">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <BrandLogo size="sm" />
          <div className="min-w-0 space-y-2">
            <p className="text-[22px] leading-[1.2] font-semibold text-[var(--text-primary)]">
              Cafe Lectura
            </p>
            <p className="meta-copy max-w-2xl">
              Club privado de lectura con biblioteca visible, coloquios para
              miembros activos y atención cercana por WhatsApp.
            </p>
          </div>
        </div>

        <nav
          className="site-footer-links"
          aria-label="Enlaces del pie de página"
        >
          <Link href="/" className="editorial-link">
            Inicio
          </Link>
          <Link href="/library" className="editorial-link">
            Biblioteca
          </Link>
          <Link href="/login" className="editorial-link">
            Iniciar sesión
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="editorial-link"
          >
            <MessageCircleMore className="h-[18px] w-[18px]" />
            Escribir por WhatsApp
          </a>
        </nav>
      </div>
    </footer>
  );
}
