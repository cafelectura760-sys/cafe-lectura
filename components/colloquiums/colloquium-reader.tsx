import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Headphones,
  LockKeyhole,
  Users,
} from "lucide-react";

import { getParticipantRoleLabel } from "@/lib/colloquiums/schemas";
import { AnimatedContentSlot } from "@/components/react-bits/animated-content-slot";
import type {
  ColloquiumDetail,
  ColloquiumParticipantRecord,
  MediaAssetRecord,
  PresentationAudioBlockRecord,
  PresentationBlockRecord,
} from "@/lib/colloquiums/types";

type ColloquiumReaderProps = {
  colloquium: ColloquiumDetail;
  previewLabel?: string | null;
};

function formatDateLabel(isoDate: string | null): string {
  if (!isoDate) {
    return "Fecha no definida";
  }

  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "long",
  }).format(new Date(isoDate));
}

function renderPlainText(content: string) {
  const blocks = content
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <p
          key={`${block.slice(0, 12)}-${index}`}
          className="text-[17px] leading-[1.75] whitespace-pre-line text-[var(--text-primary)] md:text-[18px]"
        >
          {block}
        </p>
      ))}
    </div>
  );
}

function renderAudioAsset(asset: MediaAssetRecord | null) {
  if (!asset?.signedUrl) {
    return (
      <div className="rounded-[14px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_80%,white)] p-5 text-[15px] text-[var(--text-secondary)]">
        Este audio necesita la configuración de Supabase Storage para poder
        reproducirse.
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-[color:color-mix(in_srgb,var(--border-default)_80%,transparent)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_90%,white)] p-3 shadow-inner md:p-4">
      <audio
        controls
        preload="metadata"
        className="h-11 w-full focus:outline-none"
      >
        <source src={asset.signedUrl} type={asset.mimeType} />
        Tu navegador no soporta la reproducción de audio.
      </audio>
    </div>
  );
}

function getSpeakerTone(
  role: PresentationAudioBlockRecord["speakerRole"],
): "moderator" | "participant" | undefined {
  if (role === "host") {
    return "moderator";
  }

  if (role === "presenter" || role === "guest") {
    return "participant";
  }

  return undefined;
}

function renderParticipantGroup(
  title: string,
  participants: ColloquiumParticipantRecord[],
) {
  if (participants.length === 0) {
    return null;
  }

  return (
    <section className="participant-group-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">{title}</p>
        <span className="editorial-pill">{participants.length}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {participants.map((participant) => (
          <span key={participant.id} className="editorial-pill">
            {participant.name}
          </span>
        ))}
      </div>
    </section>
  );
}

function renderAudioBlock(block: PresentationAudioBlockRecord) {
  const tone = getSpeakerTone(block.speakerRole);

  return (
    <section
      key={block.id}
      data-tone={tone}
      className="reader-section reader-audio-block space-y-6 rounded-[16px] px-6 py-7 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(31,26,23,0.08)] md:px-8 md:py-8 lg:px-10 lg:py-10"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="editorial-pill bg-[color:color-mix(in_srgb,var(--surface-default)_90%,white)] font-semibold text-[var(--text-primary)]">
              {getParticipantRoleLabel(block.speakerRole)}
            </span>
          </div>

          <h2 className="text-[22px] font-bold tracking-tight text-[var(--text-primary)] md:text-[24px]">
            {block.speakerName}
          </h2>

          {block.label ? (
            <p className="text-[15px] font-medium text-[var(--text-secondary)] md:text-[16px]">
              {block.label}
            </p>
          ) : null}
        </div>

        <span className="colloquium-block-badge inline-flex shrink-0 items-center gap-2 font-medium">
          <Headphones className="h-4 w-4 text-[var(--color-ink)]" />
          Escucha
        </span>
      </div>

      {renderAudioAsset(block.asset)}
    </section>
  );
}

function renderPresentationBlock(block: PresentationBlockRecord) {
  if (block.type === "text") {
    return (
      <section
        key={block.id}
        className="reader-section reader-text-block rounded-[16px] px-6 py-7 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(31,26,23,0.08)] md:px-8 md:py-8 lg:px-10 lg:py-10"
      >
        {renderPlainText(block.content)}
      </section>
    );
  }

  return renderAudioBlock(block);
}

export function ColloquiumReader({
  colloquium,
  previewLabel,
}: ColloquiumReaderProps) {
  const hosts = colloquium.participants.filter(
    (participant) => participant.role === "host",
  );
  const presenters = colloquium.participants.filter(
    (participant) => participant.role === "presenter",
  );
  const guests = colloquium.participants.filter(
    (participant) => participant.role === "guest",
  );
  const others = colloquium.participants.filter(
    (participant) => participant.role === "other",
  );
  const textBlockCount = colloquium.presentationBlocks.filter(
    (block) => block.type === "text",
  ).length;
  const audioBlockCount = colloquium.presentationBlocks.filter(
    (block) => block.type === "audio",
  ).length;
  const publishedLabel = colloquium.publishedAt
    ? `Publicado el ${formatDateLabel(colloquium.publishedAt)}`
    : colloquium.status === "draft"
      ? "Actualmente en borrador"
      : "Publicación pendiente";

  return (
    <div className="flex flex-col gap-7 md:gap-9 lg:gap-12">
      {previewLabel ? (
        <section className="rounded-[10px] border border-[var(--color-warning)] bg-[var(--color-warning-bg)] px-5 py-4 text-[var(--color-warning)] shadow-[0_12px_24px_rgba(31,26,23,0.05)]">
          <p className="text-[16px] font-semibold">{previewLabel}</p>
        </section>
      ) : null}

      <header className="hero-band colloquium-hero">
        <AnimatedContentSlot delay={0} distance={20} className="relative z-10">
          <div className="colloquium-meta">
            <span className="editorial-pill">
              <LockKeyhole className="h-4 w-4" />
              Coloquio privado
            </span>
            <span className="editorial-pill">
              <CalendarDays className="h-4 w-4" />
              {publishedLabel}
            </span>
          </div>

          <h1 className="display-title mt-5 max-w-4xl text-[var(--text-primary)]">
            {colloquium.title}
          </h1>

          <p className="body-large mt-5 max-w-3xl">
            Basado en{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {colloquium.bookTitle}
            </span>{" "}
            de {colloquium.bookAuthor}.
          </p>

          {colloquium.excerpt ? (
            <blockquote className="reader-pull-quote mt-6 max-w-3xl">
              <p className="body-large text-[var(--text-primary)]">
                {colloquium.excerpt}
              </p>
            </blockquote>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="editorial-pill">
              <BookOpenText className="h-4 w-4" />
              {textBlockCount} bloques de lectura
            </span>
            <span className="editorial-pill">
              <Headphones className="h-4 w-4" />
              {audioBlockCount} audios
            </span>
            <span className="editorial-pill">
              <Users className="h-4 w-4" />
              {colloquium.participants.length} participantes
            </span>
          </div>
        </AnimatedContentSlot>
      </header>

      <section className="colloquium-card surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <AnimatedContentSlot delay={1} distance={24}>
          <div className="grid gap-6 lg:grid-cols-[168px_minmax(0,1fr)_260px] lg:items-center">
            <div className="book-cover-frame mx-auto max-w-[168px] lg:mx-0">
              {colloquium.bookCoverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={colloquium.bookCoverImageUrl}
                  alt={`Portada de ${colloquium.bookTitle}`}
                  className="book-cover-image"
                />
              ) : (
                <div className="flex h-full min-h-[240px] items-center justify-center p-6 text-center text-[16px] font-semibold text-[var(--text-muted)]">
                  Portada no disponible
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center py-1">
              <p className="eyebrow">Libro de esta sesión</p>
              <h2 className="section-title mt-3 text-[var(--text-primary)]">
                {colloquium.bookTitle}
              </h2>
              <p className="meta-copy mt-3 inline-flex items-center gap-2">
                <BookOpenText className="h-4 w-4" />
                {colloquium.bookAuthor}
              </p>
              <p className="body-copy mt-4">
                Esta sesión privada profundiza en los temas, reflexiones y
                pasajes esenciales de la obra. Puedes acceder a su ficha
                completa dentro del catálogo del club.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-[color:color-mix(in_srgb,var(--color-clay)_18%,white)] pt-5 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-stretch lg:justify-center lg:self-center lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              <p className="meta-copy text-center text-[13px] sm:text-left lg:text-center">
                Ficha bibliográfica disponible en el catálogo.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href={`/library/${colloquium.bookId}`}
                  className="btn-primary justify-center text-center"
                >
                  Abrir ficha del libro
                  <ArrowRight className="h-[18px] w-[18px]" />
                </Link>
                <Link
                  href="/library"
                  className="btn-secondary justify-center text-center"
                >
                  Ver biblioteca
                </Link>
              </div>
            </div>
          </div>
        </AnimatedContentSlot>
      </section>

      <section className="surface-card-muted rounded-[14px] border border-[var(--border-default)] px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <AnimatedContentSlot delay={2} distance={24}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
            <div className="max-w-md space-y-3">
              <p className="eyebrow">Participantes</p>
              <h2 className="section-title text-[var(--text-primary)]">
                Voces que conducen la lectura
              </h2>
              <p className="body-copy">
                Anfitriones, ponentes e invitados que guían la conversación y
                aportan sus notas, lecturas y reflexiones en audio a lo largo de
                la sesión.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {renderParticipantGroup("Anfitriones", hosts)}
              {renderParticipantGroup("Ponentes", presenters)}
              {renderParticipantGroup("Invitados", guests)}
              {renderParticipantGroup("Otros participantes", others)}
              {colloquium.participants.length === 0 ? (
                <div className="participant-group-card sm:col-span-2">
                  <p className="body-copy">
                    Todavía no hay participantes visibles registrados para este
                    coloquio.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </AnimatedContentSlot>
      </section>

      {colloquium.presentationBlocks.length > 0 ? (
        <AnimatedContentSlot delay={3} distance={24}>
          <article className="reader-prose w-full max-w-none gap-6 md:gap-7">
            {colloquium.presentationBlocks.map((block) =>
              renderPresentationBlock(block),
            )}
          </article>
        </AnimatedContentSlot>
      ) : (
        <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <h2 className="subsection-title text-[var(--text-primary)]">
            Todavía no hay presentación publicada
          </h2>
          <p className="body-copy mt-4">
            Este coloquio todavía no tiene bloques visibles en la presentación.
          </p>
        </section>
      )}
    </div>
  );
}
