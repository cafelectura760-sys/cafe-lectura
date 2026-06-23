import { ExpandableText } from "@/components/colloquiums/expandable-text";
import { shouldCollapseIntervention } from "@/lib/colloquiums/schemas";
import type {
  ColloquiumDetail,
  ColloquiumEntryRecord,
  ColloquiumSectionRecord,
  MediaAssetRecord,
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
          className="body-copy whitespace-pre-line text-[var(--text-primary)]"
        >
          {block}
        </p>
      ))}
    </div>
  );
}

function getRoleLabel(entry: ColloquiumEntryRecord): string {
  if (entry.participantName?.trim()) {
    return entry.participantName.trim();
  }

  switch (entry.role) {
    case "host":
      return "Anfitrión";
    case "presenter":
      return "Ponente";
    case "reader":
      return "Lector";
    case "anonymous":
      return "Participación anónima";
    default:
      return "Intervención";
  }
}

function getSectionHeading(section: ColloquiumSectionRecord): string {
  if (section.title?.trim()) {
    return section.title.trim();
  }

  const fallbackLabels: Record<ColloquiumSectionRecord["type"], string> = {
    intro: "Introducción",
    content: "Bloque de contenido",
    qa: "Preguntas y respuestas",
    audio: "Audio",
    image: "Imagen",
    closing: "Cierre",
  };

  return fallbackLabels[section.type];
}

function renderMediaAsset(asset: MediaAssetRecord) {
  if (!asset.signedUrl) {
    return (
      <div className="rounded-[10px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_68%,white)] px-4 py-4 text-[16px] text-[var(--text-secondary)]">
        Este archivo requiere configuración de Supabase Storage para mostrarse.
      </div>
    );
  }

  if (asset.type === "audio") {
    return (
      <div className="rounded-[10px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_68%,white)] px-4 py-4">
        <audio controls preload="metadata" className="w-full">
          <source src={asset.signedUrl} type={asset.mimeType} />
          Tu navegador no soporta la reproducción de audio.
        </audio>
        {asset.title ? (
          <p className="mt-3 text-[16px] font-semibold text-[var(--text-primary)]">
            {asset.title}
          </p>
        ) : null}
        {asset.caption ? (
          <p className="body-copy mt-2">{asset.caption}</p>
        ) : null}
      </div>
    );
  }

  return (
    <figure className="space-y-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset.signedUrl}
        alt={asset.altText ?? asset.title ?? "Imagen del coloquio"}
        className="w-full rounded-[10px] border border-[var(--border-default)] object-cover shadow-[0_14px_32px_rgba(31,26,23,0.06)]"
      />
      {asset.caption ? (
        <figcaption className="text-[16px] leading-7 text-[var(--text-secondary)]">
          {asset.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function renderEntry(entry: ColloquiumEntryRecord) {
  const hasLongContent = entry.content
    ? shouldCollapseIntervention(entry.content)
    : false;

  return (
    <article
      key={entry.id}
      className="space-y-4 rounded-[10px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_88%,white)] px-5 py-5"
    >
      <div className="space-y-2">
        <p className="eyebrow">{entry.type.replace(/_/g, " ")}</p>
        <h4 className="text-[22px] leading-[1.35] font-semibold text-[var(--text-primary)]">
          {getRoleLabel(entry)}
        </h4>
        {entry.participantLocation ? (
          <p className="meta-copy">{entry.participantLocation}</p>
        ) : null}
        {entry.label ? (
          <p className="text-[16px] font-semibold text-[var(--text-secondary)]">
            {entry.label}
          </p>
        ) : null}
        {entry.centralIdea ? (
          <p className="rounded-[8px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_78%,white)] px-4 py-3 text-[16px] leading-7 text-[var(--text-primary)]">
            Idea central: {entry.centralIdea}
          </p>
        ) : null}
      </div>

      {entry.content ? (
        hasLongContent ? (
          <ExpandableText content={entry.content} />
        ) : (
          renderPlainText(entry.content)
        )
      ) : null}

      {entry.assets.length > 0 ? (
        <div className="space-y-4">
          {entry.assets.map((asset) => (
            <div key={asset.id}>{renderMediaAsset(asset)}</div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function renderSection(section: ColloquiumSectionRecord) {
  return (
    <section key={section.id} className="reader-section space-y-6">
      <div className="space-y-3">
        <p className="eyebrow">{SECTION_LABELS[section.type]}</p>
        <h2 className="subsection-title text-[var(--text-primary)]">
          {getSectionHeading(section)}
        </h2>
      </div>

      {section.content ? renderPlainText(section.content) : null}

      {section.assets.length > 0 ? (
        <div className="grid gap-5">
          {section.assets.map((asset) => (
            <div key={asset.id}>{renderMediaAsset(asset)}</div>
          ))}
        </div>
      ) : null}

      {section.entries.length > 0 ? (
        <div className="space-y-5">
          {section.entries.map((entry) => renderEntry(entry))}
        </div>
      ) : null}
    </section>
  );
}

const SECTION_LABELS: Record<ColloquiumSectionRecord["type"], string> = {
  intro: "Introducción",
  content: "Bloque de contenido",
  qa: "Preguntas y respuestas",
  audio: "Audio",
  image: "Imagen",
  closing: "Cierre",
};

export function ColloquiumReader({
  colloquium,
  previewLabel,
}: ColloquiumReaderProps) {
  return (
    <div className="space-y-8">
      {previewLabel ? (
        <section className="rounded-[10px] border border-[var(--color-warning)] bg-[var(--color-warning-bg)] px-5 py-4 text-[var(--color-warning)] shadow-[0_12px_24px_rgba(31,26,23,0.05)]">
          <p className="text-[16px] font-semibold">{previewLabel}</p>
        </section>
      ) : null}

      <header className="hero-band">
        <div className="relative z-10 flex flex-col gap-6">
          <div>
            <div className="accent-rule mb-5" />
            <p className="eyebrow">Coloquio privado</p>
            <h1 className="display-title mt-4 max-w-4xl text-[var(--text-primary)]">
              {colloquium.title}
            </h1>
            <p className="body-large mt-4 max-w-3xl">
              Basado en{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {colloquium.bookTitle}
              </span>{" "}
              de {colloquium.bookAuthor}.{" "}
              {colloquium.publishedAt
                ? `Publicado el ${formatDateLabel(colloquium.publishedAt)}.`
                : colloquium.status === "draft"
                  ? "Actualmente está en borrador."
                  : ""}
            </p>
            {colloquium.excerpt ? (
              <p className="body-copy mt-4 max-w-3xl">{colloquium.excerpt}</p>
            ) : null}
          </div>
        </div>
      </header>

      <section className="reader-panel">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
          <div className="book-cover-frame max-w-[220px]">
            {colloquium.heroImage?.signedUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={colloquium.heroImage.signedUrl}
                alt={
                  colloquium.heroImage.altText ??
                  colloquium.heroImage.title ??
                  `Imagen principal de ${colloquium.title}`
                }
                className="h-full w-full object-cover"
              />
            ) : colloquium.bookCoverImageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={colloquium.bookCoverImageUrl}
                alt={`Portada de ${colloquium.bookTitle}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center p-6 text-center text-[16px] font-semibold text-[var(--text-muted)]">
                Imagen no disponible
              </div>
            )}
          </div>

          <div className="max-w-2xl py-2">
            <p className="eyebrow">Libro relacionado</p>
            <h2 className="section-title mt-3 text-[var(--text-primary)]">
              {colloquium.bookTitle}
            </h2>
            <p className="body-copy mt-3">{colloquium.bookAuthor}</p>
            <p className="body-copy mt-5">
              Esta lectura conserva un ritmo editorial claro y ordenado,
              combinando texto, imágenes y audio sin abandonar el foco de
              lectura pausada del club.
            </p>
          </div>
        </div>
      </section>

      {colloquium.sections.length > 0 ? (
        <article className="reader-prose space-y-8">
          {colloquium.sections.map((section) => renderSection(section))}
        </article>
      ) : (
        <section className="surface-card px-6 py-7 md:px-8 md:py-8">
          <h2 className="subsection-title text-[var(--text-primary)]">
            Todavía no hay contenido publicado
          </h2>
          <p className="body-copy mt-4">
            Este coloquio todavía no tiene secciones visibles para lectura.
          </p>
        </section>
      )}
    </div>
  );
}
