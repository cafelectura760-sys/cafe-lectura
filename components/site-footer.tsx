import Link from "next/link";
import { BookOpenText, MessageCircleMore } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { createWhatsAppHref } from "@/lib/whatsapp";

export function SiteFooter() {
  const whatsappHref = createWhatsAppHref(
    "Quiero comunicarme con Café Lectura Barquisimeto por WhatsApp.",
  );

  return (
    <footer className="site-footer">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-xl min-w-0 flex-col gap-3">
          <div className="flex items-center gap-3.5">
            <BrandLogo size="sm" />
            <span className="text-[22px] leading-[1.2] font-semibold text-[var(--text-primary)]">
              Café Lectura Barquisimeto
            </span>
          </div>
          <p className="meta-copy text-[15px] leading-relaxed">
            Club de lectura con coloquios por WhatsApp, archivo privado para
            miembros y atención cercana.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center lg:flex-col lg:items-end lg:justify-center">
          <nav
            className="flex flex-wrap items-center gap-1 sm:gap-2 lg:justify-end"
            aria-label="Enlaces del pie de página"
          >
            <Link href="/" className="nav-link justify-start">
              Inicio
            </Link>
            <Link href="/library" className="nav-link justify-start">
              Colección
            </Link>
            <Link href="/login" className="nav-link justify-start">
              Iniciar sesión
            </Link>
          </nav>

          <nav
            className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2"
            aria-label="Canales y archivo de Café Lectura"
          >
            <span className="px-4 text-[14px] font-semibold text-[var(--text-secondary)]">
              Canales del club
            </span>
            <a
              href="https://www.youtube.com/@clubcafelecturabqto"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link justify-start gap-2"
              aria-label="Canal de YouTube de Café Lectura (se abre en una pestaña nueva)"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12s0 3.8.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-2 .5-5.8.5-5.8s0-3.8-.5-5.8Z"
                  fill="#C4302B"
                />
                <path d="m9.6 15.6 6.3-3.6-6.3-3.6v7.2Z" fill="white" />
              </svg>
              Canal de YouTube
            </a>
            <a
              href="https://clubcafelecturabarquisimeto.blogspot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link justify-start gap-2"
              aria-label="Archivo de coloquios en Blogspot (se abre en una pestaña nueva)"
            >
              <BookOpenText
                aria-hidden="true"
                className="h-5 w-5 text-[var(--color-verde)]"
              />
              Archivo de coloquios
            </a>
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
