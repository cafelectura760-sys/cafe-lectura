import { PageShell } from "@/components/page-shell";

export default function ColloquiumsLoading() {
  return (
    <PageShell>
      <section className="site-header">
        <div className="flex flex-1 flex-col gap-4">
          <div className="skeleton-block h-12 w-56 rounded-full" />
          <div className="flex gap-2">
            <div className="skeleton-block h-12 w-24 rounded-full" />
            <div className="skeleton-block h-12 w-28 rounded-full" />
            <div className="skeleton-block h-12 w-28 rounded-full" />
          </div>
        </div>
        <div className="skeleton-block h-24 w-full max-w-[320px] rounded-[24px]" />
      </section>

      <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="skeleton-block h-4 w-32 rounded-full" />
        <div className="skeleton-block mt-4 h-12 w-80 rounded-[20px]" />
        <div className="skeleton-block mt-4 h-20 max-w-3xl rounded-[24px]" />
      </section>

      <section className="content-grid">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="surface-card p-4 md:p-5">
            <div className="grid gap-6 lg:grid-cols-[168px_minmax(0,1fr)]">
              <div className="book-cover-frame skeleton-block" />
              <div className="space-y-4 py-2">
                <div className="skeleton-block h-4 w-32 rounded-full" />
                <div className="skeleton-block h-10 w-2/3 rounded-[20px]" />
                <div className="skeleton-block h-5 w-1/2 rounded-full" />
                <div className="skeleton-block h-24 rounded-[20px]" />
                <div className="skeleton-block h-12 w-44 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
