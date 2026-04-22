export default function LibraryLoading() {
  return (
    <main className="flex flex-1 bg-stone-100 px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
          <div className="h-4 w-36 rounded bg-stone-200" />
          <div className="mt-4 h-10 w-80 rounded bg-stone-200" />
          <div className="mt-4 h-20 max-w-3xl rounded bg-stone-200" />
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
            >
              <div className="aspect-[4/5] bg-stone-200" />
              <div className="space-y-4 p-6">
                <div className="h-8 w-2/3 rounded bg-stone-200" />
                <div className="h-5 w-1/2 rounded bg-stone-200" />
                <div className="h-24 rounded bg-stone-200" />
                <div className="h-12 w-48 rounded bg-stone-200" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
