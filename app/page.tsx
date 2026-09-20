import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Library,
  MessageCircleMore,
  ScrollText,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { BookCard } from "@/components/book-card";
import { MemberVoicesSection } from "@/components/member-voices-section";
import { PageShell } from "@/components/page-shell";
import { AnimatedContentSlot } from "@/components/react-bits/animated-content-slot";
import { BorderGlowSlot } from "@/components/react-bits/border-glow-slot";
import { SpotlightCardSlot } from "@/components/react-bits/spotlight-card-slot";
import { ReadingTableau } from "@/components/reading-tableau";
import { SectionHeading } from "@/components/section-heading";
import { StatusBanner } from "@/components/status-banner";
import { getAuthSession } from "@/lib/auth/session";
import { getPublicBooks } from "@/lib/books/data";
import { createWhatsAppHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Café Lectura Barquisimeto | Club de lectura",
  description:
    "Café Lectura Barquisimeto es un club de lectura con coloquios mensuales por WhatsApp y un archivo privado para miembros.",
};

function getMembershipHref() {
  return createWhatsAppHref(
    "Me gustaría recibir información sobre la membresía anual de Café Lectura Barquisimeto.",
  );
}

function getClubInfoHref() {
  return createWhatsAppHref(
    "Me gustaría conocer la próxima obra seleccionada, la fecha de la ponencia y cómo participar en los coloquios por WhatsApp. También quisiera información sobre la membresía web.",
  );
}

function buildBookInfoHref(title: string, author: string) {
  return createWhatsAppHref(
    `Quiero más información sobre "${title}" de ${author}.`,
  );
}

function buildBookDetailHref(bookId: string) {
  return `/library/${bookId}`;
}

export default async function Home() {
  const [session, books] = await Promise.all([
    getAuthSession(),
    getPublicBooks(),
  ]);
  const featuredBooks = books.slice(0, 3);
  const highlights = [
    {
      title: "Coloquios mensuales",
      text: "Cada mes se anuncia una obra, se presenta una ponencia y se abre un espacio de conversación en el chat del club.",
      icon: Library,
    },
    {
      title: "Participación por WhatsApp",
      text: "La participación en los coloquios por el chat del CCLB es gratuita y se coordina con la administración.",
      icon: MessageCircleMore,
    },
    {
      title: "Archivo privado del club",
      text: "Los miembros con membresía web vigente pueden consultar la colección de coloquios publicados.",
      icon: ScrollText,
    },
  ];
  const membershipSteps = [
    {
      number: "01",
      title: "Solicitar información",
      text: "Escribe por WhatsApp para conocer el proceso de membresía web y recibir las instrucciones de pago.",
    },
    {
      number: "02",
      title: "Confirmar el acceso",
      text: "Una vez confirmado el pago, la administración crea tu usuario y habilita el acceso privado a la plataforma.",
    },
    {
      number: "03",
      title: "Consultar la colección",
      text: "Mientras la membresía esté vigente, puedes consultar la colección de coloquios publicada en la web. Si vence, el acceso privado se suspende hasta renovar.",
    },
  ];

  return (
    <PageShell>
      <AppHeader
        activeHref="/"
        session={session}
        description="Club de lectura, coloquios por WhatsApp y archivo privado para miembros."
      />

      <section className="hero-band">
        <div className="relative z-10 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.9fr)] lg:items-center lg:gap-10">
          <AnimatedContentSlot delay={0} distance={20} className="min-w-0 py-2">
            <div className="accent-rule" />
            <p className="eyebrow mt-5">Club de lectura</p>
            <h1 className="display-title mt-4 max-w-4xl text-[var(--text-primary)]">
              Un club de lectura que se siente cercano desde la primera visita.
            </h1>
            <p className="body-large mt-6 max-w-3xl">
              Desde hace seis años, Café Lectura Barquisimeto es un refugio para
              compartir lo que cada obra nos hace sentir. Ya hemos leído y
              conversado sobre 70 obras literarias, y nos encantaría que te
              sumaras al club. Cada mes se anuncia previamente en el chat del
              CCLB la obra seleccionada y la fecha de la ponencia. Después de la
              presentación, el grupo se abre para conversar y compartir
              impresiones.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {session ? (
                <Link href="/colloquiums" className="btn-primary">
                  Ver coloquios privados
                  <ArrowRight className="h-[18px] w-[18px]" />
                </Link>
              ) : (
                <a
                  href={getMembershipHref()}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  Consultar membresía web
                  <ArrowRight className="h-[18px] w-[18px]" />
                </a>
              )}
              <Link href="/library" className="btn-secondary">
                Conocer la colección
              </Link>
            </div>
          </AnimatedContentSlot>

          <ReadingTableau />
        </div>

        <div className="content-grid mt-10 md:grid-cols-2 2xl:grid-cols-3">
          {highlights.map((item, index) => {
            const Icon = item.icon;

            return (
              <AnimatedContentSlot
                key={item.title}
                delay={1.5 + index * 1.5}
                distance={28}
                className="h-full"
              >
                <SpotlightCardSlot className="editorial-note lift-on-hover h-full !p-5 md:!p-6">
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[var(--surface-default)] text-[var(--color-casa)] shadow-[0_10px_22px_rgba(31,26,23,0.06)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-[22px] leading-[1.24] font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </h2>
                      <p className="body-copy mt-2">{item.text}</p>
                    </div>
                  </div>
                </SpotlightCardSlot>
              </AnimatedContentSlot>
            );
          })}
        </div>
      </section>

      <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <AnimatedContentSlot delay={0} distance={20}>
          <SectionHeading
            eyebrow="Colección del club"
            title="Coloquios y ponencias para consultar con calma"
            description="Esta sección presenta algunas de las obras trabajadas por Café Lectura Barquisimeto. El acceso completo a la colección de coloquios corresponde a los miembros con membresía web vigente."
            action={
              <Link href="/library" className="editorial-link">
                Ver la colección
              </Link>
            }
          />
        </AnimatedContentSlot>

        {featuredBooks.length === 0 ? (
          <div className="mt-8">
            <StatusBanner title="Colección en preparación">
              Todavía no hay obras publicadas en esta sección. En cuanto la
              administración cargue nuevos contenidos, aparecerán aquí.
            </StatusBanner>
          </div>
        ) : (
          <div className="content-grid mt-8 md:grid-cols-2 xl:grid-cols-3">
            {featuredBooks.map((book, index) => (
              <AnimatedContentSlot
                key={book.id}
                delay={1 + index * 1.5}
                distance={28}
                className="h-full"
              >
                <BookCard
                  book={book}
                  eyebrow="Obra trabajada"
                  detailHref={buildBookDetailHref(book.id)}
                  inquiryHref={buildBookInfoHref(book.title, book.author)}
                  inquiryLabel="Más información"
                  compact
                />
              </AnimatedContentSlot>
            ))}
          </div>
        )}
      </section>

      <MemberVoicesSection />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <AnimatedContentSlot delay={0} distance={20}>
            <SectionHeading
              eyebrow="Membresía web"
              title="Accede al archivo privado del club durante todo el año"
              description="La membresía anual cuesta US$7 y se gestiona directamente por WhatsApp. La participación en los coloquios del chat del CCLB es gratuita; la membresía corresponde al acceso privado a la colección publicada en la página web."
            />
          </AnimatedContentSlot>

          <div className="content-grid mt-8 md:grid-cols-3">
            {membershipSteps.map((step, index) => (
              <AnimatedContentSlot
                key={step.number}
                delay={1 + index * 1.5}
                distance={24}
                className="h-full"
              >
                <article className="editorial-step h-full">
                  <div className="flex items-center gap-3">
                    <span className="editorial-step-number">{step.number}</span>
                    <h3 className="text-[20px] font-semibold text-[var(--text-primary)]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="body-copy mt-4">{step.text}</p>
                </article>
              </AnimatedContentSlot>
            ))}
          </div>
        </article>

        {session ? (
          <BorderGlowSlot
            className="h-full rounded-[14px]"
            backgroundColor="linear-gradient(145deg, color-mix(in srgb, var(--color-fig) 96%, var(--color-casa)) 0%, color-mix(in srgb, var(--color-dune) 80%, var(--color-casa)) 100%)"
          >
            <aside className="h-full px-6 py-7 text-[var(--text-on-dark)] md:px-7 md:py-8">
              <p className="eyebrow text-[color:color-mix(in_srgb,var(--color-paper-soft)_80%,white)]">
                Tu espacio privado
              </p>
              <div className="accent-rule mt-4" />
              <h2 className="section-title mt-3 text-[var(--text-on-dark)]">
                Tu acceso web está activo
              </h2>
              <p className="mt-4 text-[18px] leading-8 text-[color:color-mix(in_srgb,var(--color-paper)_84%,white)]">
                Puedes consultar la colección de coloquios publicados y volver a
                cada presentación con calma.
              </p>
              <div className="mt-8">
                <Link href="/colloquiums" className="btn-warm">
                  Ir a los coloquios
                  <ArrowRight className="h-[18px] w-[18px]" />
                </Link>
              </div>
            </aside>
          </BorderGlowSlot>
        ) : (
          <BorderGlowSlot
            className="h-full rounded-[14px]"
            backgroundColor="linear-gradient(145deg, color-mix(in srgb, var(--color-fig) 96%, var(--color-casa)) 0%, color-mix(in srgb, var(--color-dune) 80%, var(--color-casa)) 100%)"
          >
            <aside className="h-full px-6 py-7 text-[var(--text-on-dark)] md:px-7 md:py-8">
              <p className="eyebrow text-[color:color-mix(in_srgb,var(--color-paper-soft)_80%,white)]">
                Participación por WhatsApp
              </p>
              <div className="accent-rule mt-4" />
              <h2 className="section-title mt-3 text-[var(--text-on-dark)]">
                Forma parte de los coloquios del CCLB
              </h2>
              <p className="mt-4 text-[18px] leading-8 text-[color:color-mix(in_srgb,var(--color-paper)_84%,white)]">
                La participación en el chat y en las discusiones es gratuita.
                Escríbenos por WhatsApp para conocer la próxima obra
                seleccionada, la fecha de la ponencia y el proceso de membresía
                web.
              </p>
              <div className="mt-8">
                <a
                  href={getClubInfoHref()}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-warm"
                >
                  Escribir por WhatsApp
                  <ArrowRight className="h-[18px] w-[18px]" />
                </a>
              </div>
            </aside>
          </BorderGlowSlot>
        )}
      </section>
    </PageShell>
  );
}
