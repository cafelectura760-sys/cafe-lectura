import { PageShell } from "@/components/page-shell";

export default function LibraryLoading() {
  return (
    <PageShell>
      <section className="site-header">
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-12 w-56 rounded-full bg-[var(--surface-subtle)]" />
          <div className="flex gap-2">
            <div className="h-12 w-24 rounded-full bg-[var(--surface-subtle)]" />
            <div className="h-12 w-28 rounded-full bg-[var(--surface-subtle)]" />
          </div>
        </div>
        <div className="h-12 w-56 rounded-full bg-[var(--surface-subtle)]" />
      </section>

      <section className="surface-card px-6 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10">
        <div className="h-4 w-40 rounded-full bg-[var(--surface-subtle)]" />
        <div className="mt-4 h-16 max-w-4xl rounded-[24px] bg-[var(--surface-subtle)]" />
        <div className="mt-4 h-24 max-w-3xl rounded-[24px] bg-[var(--surface-subtle)]" />
      </section>

      <section className="content-grid md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="surface-card p-4 md:p-5">
            <div className="book-cover-frame bg-[var(--surface-subtle)]" />
            <div className="mt-5 space-y-4 px-2">
              <div className="h-4 w-28 rounded-full bg-[var(--surface-subtle)]" />
              <div className="h-10 w-2/3 rounded-[18px] bg-[var(--surface-subtle)]" />
              <div className="h-5 w-1/2 rounded-full bg-[var(--surface-subtle)]" />
              <div className="h-28 rounded-[20px] bg-[var(--surface-subtle)]" />
              <div className="h-12 w-full rounded-full bg-[var(--surface-subtle)]" />
            </div>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
