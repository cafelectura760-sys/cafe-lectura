import { PageShell } from "@/components/page-shell";

export default function LibraryBookDetailLoading() {
  return (
    <PageShell>
      <section className="site-header">
        <div className="flex flex-1 flex-col gap-4">
          <div className="skeleton-block h-12 w-56 rounded-full" />
          <div className="flex gap-2">
            <div className="skeleton-block h-12 w-24 rounded-full" />
            <div className="skeleton-block h-12 w-28 rounded-full" />
          </div>
        </div>
        <div className="skeleton-block h-12 w-56 rounded-full" />
      </section>

      <section className="hero-band">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="book-cover-frame skeleton-block max-w-[220px]" />
          <div className="space-y-4 py-2">
            <div className="flex flex-wrap gap-3">
              <div className="skeleton-block h-11 w-40 rounded-full" />
              <div className="skeleton-block h-11 w-36 rounded-full" />
            </div>
            <div className="skeleton-block h-4 w-32 rounded-full" />
            <div className="skeleton-block h-16 max-w-3xl rounded-[24px]" />
            <div className="skeleton-block h-5 w-1/2 rounded-full" />
            <div className="skeleton-block h-24 max-w-3xl rounded-[24px]" />
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="skeleton-block h-12 w-full rounded-full sm:w-56" />
              <div className="skeleton-block h-12 w-full rounded-full sm:w-48" />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-6">
        <div className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <div className="skeleton-block h-4 w-36 rounded-full" />
          <div className="skeleton-block mt-4 h-12 max-w-2xl rounded-[20px]" />
          <div className="skeleton-block mt-4 h-24 max-w-3xl rounded-[24px]" />
          <div className="skeleton-block mt-6 h-40 rounded-[24px]" />
        </div>

        <div className="editorial-note-strong px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div>
              <div className="skeleton-block h-4 w-28 rounded-full" />
              <div className="skeleton-block mt-3 h-12 max-w-xl rounded-[20px]" />
              <div className="skeleton-block mt-4 h-20 max-w-lg rounded-[24px]" />
            </div>
            <div className="flex flex-col gap-6">
              <div className="skeleton-block h-28 rounded-[24px]" />
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="skeleton-block h-12 flex-1 rounded-full" />
                <div className="skeleton-block h-12 flex-1 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
