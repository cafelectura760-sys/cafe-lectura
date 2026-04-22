export default function ColloquiumDetailLoading() {
  return (
    <main className="flex flex-1 bg-stone-100 px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
          <div className="h-4 w-32 rounded bg-stone-200" />
          <div className="mt-4 h-12 w-3/4 rounded bg-stone-200" />
          <div className="mt-4 h-16 w-2/3 rounded bg-stone-200" />
        </section>

        <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
            <div className="min-h-64 bg-stone-200" />
            <div className="space-y-4 p-8">
              <div className="h-4 w-32 rounded bg-stone-200" />
              <div className="h-10 w-2/3 rounded bg-stone-200" />
              <div className="h-6 w-1/2 rounded bg-stone-200" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="h-8 w-1/3 rounded bg-stone-200" />
              <div className="mt-4 h-32 rounded bg-stone-200" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
