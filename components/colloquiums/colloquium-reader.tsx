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
        Este audio necesita la configuración de Supabase Storage para
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

function renderParticipantList(
  title: string,
  participants: ColloquiumParticipantRecord[],
) {
  if (participants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="eyebrow">{title}</p>
      <div className="flex flex-wrap gap-3">
        {participants.map((participant) => (
          <span
            key={participant.id}
            className="rounded-full border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_78%,white)] px-4 py-2 text-[15px] font-semibold text-[var(--text-primary)]"
          >
            {participant.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function renderAudioBlock(block: PresentationAudioBlockRecord) {
  return (
    <section
      key={block.id}
      className="reader-section space-y-5 rounded-[12px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_88%,white)] px-6 py-6"
    >
      <div className="space-y-2">
        <p className="eyebrow">{getParticipantRoleLabel(block.speakerRole)}</p>
        <h2 className="subsection-title text-[var(--text-primary)]">
          {block.speakerName}
        </h2>
        {block.label ? (
          <p className="body-copy text-[var(--text-secondary)]">
            {block.label}
          </p>
        ) : null}
      </div>

      {renderAudioAsset(block.asset)}
    </section>
  );
}

function renderPresentationBlock(block: PresentationBlockRecord) {
  if (block.type === "text") {
    return (
      <section key={block.id} className="reader-section space-y-5">
        <div className="space-y-2">
          <p className="eyebrow">Presentación</p>
        </div>
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
            {colloquium.bookCoverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
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

          <div className="max-w-2xl space-y-6 py-2">
            <div>
              <p className="eyebrow">Libro relacionado</p>
              <h2 className="section-title mt-3 text-[var(--text-primary)]">
                {colloquium.bookTitle}
              </h2>
              <p className="body-copy mt-3">{colloquium.bookAuthor}</p>
            </div>

            {renderParticipantList("Anfitriones", hosts)}
            {renderParticipantList("Ponentes", presenters)}
            {renderParticipantList("Invitados", guests)}
            {renderParticipantList("Otros participantes", others)}
          </div>
        </div>
      </section>

      {colloquium.presentationBlocks.length > 0 ? (
        <article className="reader-prose space-y-8">
          {colloquium.presentationBlocks.map((block) =>
            renderPresentationBlock(block),
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
