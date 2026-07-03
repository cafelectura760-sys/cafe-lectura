import { PageShell } from "@/components/page-shell";

export default function ColloquiumDetailLoading() {
  return (
    <PageShell>
      <div className="surface-card-muted flex items-center justify-between rounded-[14px] px-6 py-4">
        <div className="skeleton-block h-8 w-48 rounded-full" />
        <div className="flex gap-3">
          <div className="skeleton-block h-8 w-24 rounded-full" />
          <div className="skeleton-block h-8 w-24 rounded-full" />
        </div>
      </div>

      <section className="hero-band">
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
      </section>

      <section className="colloquium-card surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[168px_minmax(0,1fr)_260px] lg:items-center">
          <div className="book-cover-frame skeleton-block h-[240px] max-w-[168px]" />
          <div className="space-y-4 py-1">
            <div className="skeleton-block h-4 w-36 rounded-full" />
            <div className="skeleton-block h-8 w-2/3 rounded-[20px]" />
            <div className="skeleton-block h-5 w-1/2 rounded-full" />
            <div className="skeleton-block h-16 rounded-[20px]" />
          </div>
          <div className="space-y-3">
            <div className="skeleton-block h-4 w-full rounded-full" />
            <div className="skeleton-block h-11 w-full rounded-full" />
            <div className="skeleton-block h-11 w-full rounded-full" />
          </div>
        </div>
      </section>

      <section className="surface-card-muted rounded-[14px] border border-[var(--border-default)] px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
          <div className="space-y-3">
            <div className="skeleton-block h-4 w-28 rounded-full" />
            <div className="skeleton-block h-8 w-64 rounded-[20px]" />
            <div className="skeleton-block h-16 rounded-[20px]" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="skeleton-block h-24 rounded-[20px]" />
            <div className="skeleton-block h-24 rounded-[20px]" />
          </div>
        </div>
      </section>

      <section className="reader-prose w-full max-w-none gap-6 md:gap-7">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="reader-section rounded-[16px] px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="skeleton-block h-8 w-32 rounded-full" />
              <div className="skeleton-block h-9 w-28 rounded-full" />
            </div>
            <div className="skeleton-block mt-6 h-28 rounded-[16px]" />
          </div>
        ))}
      </section>
    </PageShell>
  );
}
