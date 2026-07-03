import { PageShell } from "@/components/page-shell";

export default function LibraryLoading() {
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

      <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="skeleton-block h-4 w-40 rounded-full" />
        <div className="skeleton-block mt-4 h-16 max-w-4xl rounded-[24px]" />
        <div className="skeleton-block mt-4 h-24 max-w-3xl rounded-[24px]" />
      </section>

      <section className="content-grid md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="surface-card p-4 md:p-5">
            <div className="book-cover-frame skeleton-block" />
            <div className="mt-5 space-y-4 px-2">
              <div className="skeleton-block h-4 w-28 rounded-full" />
              <div className="skeleton-block h-10 w-2/3 rounded-[18px]" />
              <div className="skeleton-block h-5 w-1/2 rounded-full" />
              <div className="skeleton-block h-28 rounded-[20px]" />
              <div className="skeleton-block h-12 w-full rounded-full" />
            </div>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
