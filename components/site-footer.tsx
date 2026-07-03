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
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-xl min-w-0 flex-col gap-3">
          <div className="flex items-center gap-3.5">
            <BrandLogo size="sm" />
            <span className="text-[22px] leading-[1.2] font-semibold text-[var(--text-primary)]">
              Cafe Lectura
            </span>
          </div>
          <p className="meta-copy text-[15px] leading-relaxed">
            Club privado de lectura con biblioteca visible, coloquios para
            miembros activos y atención cercana por WhatsApp.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end lg:justify-center">
          <nav
            className="flex flex-wrap items-center gap-1 sm:gap-2 lg:justify-end"
            aria-label="Enlaces del pie de página"
          >
            <Link href="/" className="nav-link justify-start">
              Inicio
            </Link>
            <Link href="/library" className="nav-link justify-start">
              Biblioteca
            </Link>
            <Link href="/login" className="nav-link justify-start">
              Iniciar sesión
            </Link>
          </nav>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary w-full px-4 py-2 text-[15px] shadow-sm sm:w-auto md:min-h-11 md:text-[16px]"
          >
            <MessageCircleMore className="h-[18px] w-[18px] text-[var(--color-verde)]" />
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
