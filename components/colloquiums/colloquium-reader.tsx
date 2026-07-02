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

function formatBlockNumber(index: number): string {
  return index.toString().padStart(2, "0");
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
          className="body-copy whitespace-pre-line text-[var(--text-primary)]"
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
      <div className="rounded-[10px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_68%,white)] px-4 py-4 text-[16px] text-[var(--text-secondary)]">
        Este audio necesita la configuración de Supabase Storage para poder
        reproducirse.
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_68%,white)] px-4 py-4">
      <audio controls preload="metadata" className="w-full">
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

function renderAudioBlock(block: PresentationAudioBlockRecord, index: number) {
  const tone = getSpeakerTone(block.speakerRole);

  return (
    <section
      key={block.id}
      data-tone={tone}
      className="reader-section reader-audio-block space-y-5"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="editorial-pill">
              <Headphones className="h-4 w-4" />
              Audio {formatBlockNumber(index)}
            </span>
            <span className="editorial-pill">
              {getParticipantRoleLabel(block.speakerRole)}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="subsection-title text-[var(--text-primary)]">
              {block.speakerName}
            </h2>
            <p className="body-copy text-[var(--text-secondary)]">
              {block.label ?? "Intervención en audio disponible para escuchar."}
            </p>
          </div>
        </div>

        <span className="colloquium-block-badge">Escucha</span>
      </div>

      {renderAudioAsset(block.asset)}
    </section>
  );
}

function renderPresentationBlock(
  block: PresentationBlockRecord,
  index: number,
) {
  if (block.type === "text") {
    return (
      <section
        key={block.id}
        className="reader-section reader-text-block space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">Presentación</p>
          <span className="editorial-pill">
            Bloque {formatBlockNumber(index)}
          </span>
        </div>
        {renderPlainText(block.content)}
      </section>
    );
  }

  return renderAudioBlock(block, index);
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
    <div className="space-y-8">
      {previewLabel ? (
        <section className="rounded-[10px] border border-[var(--color-warning)] bg-[var(--color-warning-bg)] px-5 py-4 text-[var(--color-warning)] shadow-[0_12px_24px_rgba(31,26,23,0.05)]">
          <p className="text-[16px] font-semibold">{previewLabel}</p>
        </section>
      ) : null}

      <header className="hero-band colloquium-hero">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="min-w-0">
            <div className="accent-rule mb-5" />
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
              <blockquote className="reader-pull-quote mt-6">
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
          </div>

          <aside className="colloquium-aside-card">
            <p className="eyebrow">Antes de entrar</p>
            <h2 className="subsection-title mt-3 text-[var(--text-primary)]">
              Una pieza principal del club, no una lectura de paso
            </h2>
            <p className="body-copy mt-4">
              Este detalle reúne contexto, voces y audios en una misma
              composición para que la experiencia se sienta más cuidada desde el
              primer vistazo.
            </p>

            <ul className="detail-rich-list mt-6">
              <li>Una apertura escrita para entrar con contexto.</li>
              <li>Intervenciones en audio organizadas por participante.</li>
              <li>
                Acceso directo al libro relacionado y al resto de la sala.
              </li>
            </ul>

            <div className="mt-7 flex flex-col gap-3">
              <Link
                href={`/library/${colloquium.bookId}`}
                className="btn-primary w-full"
              >
                Abrir ficha del libro
                <ArrowRight className="h-[18px] w-[18px]" />
              </Link>
              <Link href="/colloquiums" className="btn-secondary w-full">
                Explorar otros coloquios
              </Link>
            </div>
          </aside>
        </div>
      </header>

      <section className="colloquium-context-grid">
        <section className="reader-panel">
          <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
            <div className="book-cover-frame max-w-[220px]">
              {colloquium.bookCoverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={colloquium.bookCoverImageUrl}
                  alt={`Portada de ${colloquium.bookTitle}`}
                  className="book-cover-image"
                />
              ) : (
                <div className="flex h-full min-h-[280px] items-center justify-center p-6 text-center text-[16px] font-semibold text-[var(--text-muted)]">
                  Imagen no disponible
                </div>
              )}
            </div>

            <div className="max-w-2xl space-y-6 py-2">
              <div>
                <p className="eyebrow">Libro de esta sesión</p>
                <h2 className="section-title mt-3 text-[var(--text-primary)]">
                  {colloquium.bookTitle}
                </h2>
                <p className="body-copy mt-3">{colloquium.bookAuthor}</p>
                <p className="body-copy mt-4">
                  El libro ya no compite con el resto del detalle: ahora actúa
                  como una entrada clara hacia su propia ficha y deja espacio
                  para que el coloquio tome protagonismo.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={`/library/${colloquium.bookId}`}
                  className="btn-primary"
                >
                  Abrir ficha del libro
                  <ArrowRight className="h-[18px] w-[18px]" />
                </Link>
                <Link href="/library" className="btn-secondary">
                  Ver biblioteca completa
                </Link>
              </div>
            </div>
          </div>
        </section>

        <aside className="editorial-note-strong h-full">
          <p className="eyebrow">Participantes</p>
          <h2 className="subsection-title mt-3 text-[var(--text-primary)]">
            Voces que conducen la lectura
          </h2>
          <p className="body-copy mt-3">
            La composición separa mejor los roles para que el lector entienda
            quién introduce, quién presenta y quién acompaña la conversación.
          </p>

          <div className="mt-6 grid gap-4">
            {renderParticipantGroup("Anfitriones", hosts)}
            {renderParticipantGroup("Ponentes", presenters)}
            {renderParticipantGroup("Invitados", guests)}
            {renderParticipantGroup("Otros participantes", others)}
            {colloquium.participants.length === 0 ? (
              <section className="participant-group-card">
                <p className="body-copy">
                  Todavía no hay participantes visibles registrados para este
                  coloquio.
                </p>
              </section>
            ) : null}
          </div>
        </aside>
      </section>

      {colloquium.presentationBlocks.length > 0 ? (
        <article className="reader-prose space-y-8">
          {colloquium.presentationBlocks.map((block, index) =>
            renderPresentationBlock(block, index + 1),
          )}
        </article>
      ) : (
        <section className="surface-card px-6 py-7 md:px-8 md:py-8">
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
