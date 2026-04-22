import Link from "next/link";

import { logoutAction } from "@/lib/auth/actions";
import { getAuthSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await getAuthSession();

  return (
    <main className="flex flex-1 bg-stone-100 px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
            Cafe Lectura
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-stone-900">
            Supabase foundation is now connected to the project.
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-700">
            This temporary home page confirms the backend groundwork: session
            handling, server-side access checks, admin bypass, and membership
            gating are all wired and ready to support the real product pages.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-stone-900">
              Current session
            </h2>

            {session ? (
              <div className="mt-6 space-y-4 text-base leading-7 text-stone-700">
                <p>
                  Signed in as{" "}
                  <span className="font-semibold">
                    {session.profile?.full_name ??
                      session.email ??
                      "Unknown user"}
                  </span>
                  .
                </p>
                <p>
                  Role:{" "}
                  <span className="font-semibold">
                    {session.profile?.role ?? "missing-profile"}
                  </span>
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/colloquiums"
                    className="inline-flex items-center justify-center rounded-md bg-stone-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-stone-700"
                  >
                    Open colloquiums
                  </Link>

                  {session.profile?.role === "admin" ? (
                    <Link
                      href="/admin"
                      className="inline-flex items-center justify-center rounded-md border border-stone-300 px-4 py-3 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
                    >
                      Open admin
                    </Link>
                  ) : null}

                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="rounded-md border border-stone-300 px-4 py-3 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4 text-base leading-7 text-stone-700">
                <p>No active session is stored in the application right now.</p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md bg-stone-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-stone-700"
                >
                  Go to login
                </Link>
              </div>
            )}
          </div>

          <aside className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-stone-900">
              Verification paths
            </h2>
            <ul className="mt-6 space-y-4 text-base leading-7 text-stone-700">
              <li>
                <span className="font-semibold">/login</span> validates manual
                sign-in with Supabase Auth.
              </li>
              <li>
                <span className="font-semibold">/colloquiums</span> requires an
                authenticated user with active membership, unless the user is an
                admin.
              </li>
              <li>
                <span className="font-semibold">/admin</span> requires
                role-based admin access.
              </li>
              <li>
                <span className="font-semibold">/membership-expired</span> shows
                the WhatsApp recovery path for expired members.
              </li>
              <li>
                <span className="font-semibold">/api/health/supabase</span>{" "}
                gives us a minimal connectivity probe.
              </li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
