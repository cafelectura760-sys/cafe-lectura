import Link from "next/link";

export default function ColloquiumNotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-stone-100 px-6 py-12">
      <section className="w-full max-w-2xl rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
          Coloquio no encontrado
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">
          No encontramos este coloquio
        </h1>
        <p className="mt-4 text-base leading-8 text-stone-700">
          Es posible que el contenido haya sido movido, eliminado o que el
          enlace ya no este disponible.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/colloquiums"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-stone-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-stone-800"
          >
            Volver a coloquios
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-stone-300 px-5 py-3 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
