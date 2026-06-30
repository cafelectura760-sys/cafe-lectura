import { PageShell } from "@/components/page-shell";

export default function ColloquiumDetailLoading() {
  return (
    <PageShell width="reading" footer="none">
      <section className="surface-card-muted px-5 py-5 md:px-6 md:py-5">
        <div className="flex flex-wrap gap-3">
          <div className="skeleton-block h-11 w-40 rounded-full" />
          <div className="skeleton-block h-11 w-28 rounded-full" />
          <div className="skeleton-block h-11 w-24 rounded-full" />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="skeleton-block h-5 w-48 rounded-full" />
          <div className="skeleton-block h-11 w-36 rounded-full" />
        </div>
      </section>

      <section className="reader-panel">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="book-cover-frame skeleton-block" />
          <div className="space-y-4 py-2">
            <div className="skeleton-block h-4 w-36 rounded-full" />
            <div className="skeleton-block h-10 w-2/3 rounded-[20px]" />
            <div className="skeleton-block h-5 w-1/2 rounded-full" />
            <div className="skeleton-block h-24 rounded-[24px]" />
          </div>
        </div>
      </section>

      <section className="reader-prose">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="reader-section">
            <div className="skeleton-block h-8 w-1/3 rounded-[18px]" />
            <div className="skeleton-block mt-4 h-36 rounded-[20px]" />
          </div>
        ))}
      </section>
    </PageShell>
  );
}
