import { PageShell } from "@/components/page-shell";

export default function ColloquiumsLoading() {
  return (
    <PageShell width="regular">
      <section className="site-header">
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-12 w-56 rounded-full bg-[var(--surface-subtle)]" />
          <div className="flex gap-2">
            <div className="h-12 w-24 rounded-full bg-[var(--surface-subtle)]" />
            <div className="h-12 w-28 rounded-full bg-[var(--surface-subtle)]" />
            <div className="h-12 w-28 rounded-full bg-[var(--surface-subtle)]" />
          </div>
        </div>
        <div className="h-24 w-full max-w-[320px] rounded-[24px] bg-[var(--surface-subtle)]" />
      </section>

      <section className="surface-card px-6 py-7 md:px-8 md:py-8">
        <div className="h-4 w-32 rounded-full bg-[var(--surface-subtle)]" />
        <div className="mt-4 h-12 w-80 rounded-[20px] bg-[var(--surface-subtle)]" />
        <div className="mt-4 h-20 max-w-3xl rounded-[24px] bg-[var(--surface-subtle)]" />
      </section>

      <section className="content-grid">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="surface-card p-4 md:p-5">
            <div className="grid gap-6 lg:grid-cols-[168px_minmax(0,1fr)]">
              <div className="book-cover-frame bg-[var(--surface-subtle)]" />
              <div className="space-y-4 py-2">
                <div className="h-4 w-32 rounded-full bg-[var(--surface-subtle)]" />
                <div className="h-10 w-2/3 rounded-[20px] bg-[var(--surface-subtle)]" />
                <div className="h-5 w-1/2 rounded-full bg-[var(--surface-subtle)]" />
                <div className="h-24 rounded-[20px] bg-[var(--surface-subtle)]" />
                <div className="h-12 w-44 rounded-full bg-[var(--surface-subtle)]" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
