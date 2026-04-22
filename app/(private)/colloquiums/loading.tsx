export default function ColloquiumsLoading() {
  return (
    <main className="flex flex-1 bg-stone-100 px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
          <div className="h-4 w-32 rounded bg-stone-200" />
          <div className="mt-4 h-10 w-72 rounded bg-stone-200" />
          <div className="mt-4 h-20 max-w-2xl rounded bg-stone-200" />
        </section>

        <section className="grid gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="h-48 w-full max-w-40 rounded bg-stone-200" />
                <div className="flex-1 space-y-4">
                  <div className="h-4 w-32 rounded bg-stone-200" />
                  <div className="h-8 w-2/3 rounded bg-stone-200" />
                  <div className="h-5 w-1/2 rounded bg-stone-200" />
                  <div className="h-24 rounded bg-stone-200" />
                  <div className="h-12 w-44 rounded bg-stone-200" />
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
