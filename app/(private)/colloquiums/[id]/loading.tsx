import { PageShell } from "@/components/page-shell";

export default function ColloquiumDetailLoading() {
  return (
    <PageShell width="reading" footer="none">
      <section className="surface-card-muted px-5 py-5 md:px-6 md:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="skeleton-block h-11 w-44 rounded-full" />
            <div className="flex flex-wrap gap-3">
              <div className="skeleton-block h-5 w-44 rounded-full" />
              <div className="skeleton-block h-11 w-28 rounded-full" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="skeleton-block h-11 w-28 rounded-full" />
            <div className="skeleton-block h-11 w-20 rounded-full" />
            <div className="skeleton-block h-11 w-32 rounded-full" />
          </div>
        </div>
      </section>

      <section className="hero-band">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="skeleton-block h-11 w-40 rounded-full" />
              <div className="skeleton-block h-11 w-52 rounded-full" />
            </div>
            <div className="skeleton-block h-16 max-w-4xl rounded-[24px]" />
            <div className="skeleton-block h-10 max-w-3xl rounded-[20px]" />
            <div className="skeleton-block h-28 max-w-3xl rounded-[24px]" />
            <div className="flex flex-wrap gap-3">
              <div className="skeleton-block h-11 w-40 rounded-full" />
              <div className="skeleton-block h-11 w-32 rounded-full" />
              <div className="skeleton-block h-11 w-36 rounded-full" />
            </div>
          </div>
          <div className="editorial-note-strong px-5 py-5 md:px-6 md:py-6">
            <div className="skeleton-block h-4 w-28 rounded-full" />
            <div className="skeleton-block mt-4 h-12 rounded-[20px]" />
            <div className="skeleton-block mt-4 h-28 rounded-[24px]" />
            <div className="skeleton-block mt-6 h-12 rounded-full" />
            <div className="skeleton-block mt-3 h-12 rounded-full" />
          </div>
        </div>
      </section>

      <section className="colloquium-context-grid">
        <div className="reader-panel">
          <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="book-cover-frame skeleton-block max-w-[220px]" />
            <div className="space-y-4 py-2">
              <div className="skeleton-block h-4 w-36 rounded-full" />
              <div className="skeleton-block h-10 w-2/3 rounded-[20px]" />
              <div className="skeleton-block h-5 w-1/2 rounded-full" />
              <div className="skeleton-block h-24 rounded-[24px]" />
            </div>
          </div>
        </div>

        <div className="editorial-note-strong px-5 py-5 md:px-6 md:py-6">
          <div className="skeleton-block h-4 w-28 rounded-full" />
          <div className="skeleton-block mt-4 h-12 rounded-[20px]" />
          <div className="skeleton-block mt-4 h-24 rounded-[24px]" />
          <div className="skeleton-block mt-6 h-20 rounded-[20px]" />
          <div className="skeleton-block mt-3 h-20 rounded-[20px]" />
        </div>
      </section>

      <section className="reader-prose">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="reader-section">
            <div className="flex items-center justify-between gap-3">
              <div className="skeleton-block h-4 w-28 rounded-full" />
              <div className="skeleton-block h-11 w-28 rounded-full" />
            </div>
            <div className="skeleton-block mt-4 h-36 rounded-[20px]" />
          </div>
        ))}
      </section>
    </PageShell>
  );
}
