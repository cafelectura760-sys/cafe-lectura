import { PageShell } from "@/components/page-shell";

export default function ColloquiumDetailLoading() {
  return (
    <PageShell width="reading">
      <section className="surface-card px-5 py-5 md:px-7 md:py-6">
        <div className="h-4 w-32 rounded-full bg-[var(--surface-subtle)]" />
        <div className="mt-4 h-14 max-w-3xl rounded-[24px] bg-[var(--surface-subtle)]" />
        <div className="mt-4 h-24 max-w-3xl rounded-[24px] bg-[var(--surface-subtle)]" />
      </section>

      <section className="reader-panel">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="book-cover-frame bg-[var(--surface-subtle)]" />
          <div className="space-y-4 py-2">
            <div className="h-4 w-36 rounded-full bg-[var(--surface-subtle)]" />
            <div className="h-10 w-2/3 rounded-[20px] bg-[var(--surface-subtle)]" />
            <div className="h-5 w-1/2 rounded-full bg-[var(--surface-subtle)]" />
            <div className="h-24 rounded-[24px] bg-[var(--surface-subtle)]" />
          </div>
        </div>
      </section>

      <section className="reader-prose">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="reader-section bg-[var(--surface-subtle)]"
          >
            <div className="h-8 w-1/3 rounded-[18px] bg-[var(--surface-emphasis)]" />
            <div className="mt-4 h-36 rounded-[20px] bg-[var(--surface-emphasis)]" />
          </div>
        ))}
      </section>
    </PageShell>
  );
}
