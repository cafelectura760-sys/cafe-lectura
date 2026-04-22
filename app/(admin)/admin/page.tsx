import type { Metadata } from "next";
import Link from "next/link";

import { createBookAction, updateBookAction } from "@/lib/admin/book-actions";
import { listAdminBooks } from "@/lib/admin/book-management";
import {
  createMemberAction,
  extendMembershipAction,
  updateMemberAction,
} from "@/lib/admin/actions";
import {
  getDefaultMembershipDateInput,
  getMembershipDateInputValue,
  listAdminMembers,
} from "@/lib/admin/member-management";
import { logoutAction } from "@/lib/auth/actions";
import { requireAdmin } from "@/lib/auth/session";

type AdminPageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Admin | Cafe Lectura",
  description: "Administrative area for Cafe Lectura.",
};

function getSearchParamValue(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return null;
}

function getFeedbackMessage(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const status = getSearchParamValue(searchParams.status);
  const error = getSearchParamValue(searchParams.error);

  if (status === "member-created") {
    return {
      tone: "success" as const,
      message:
        "La cuenta fue creada correctamente y ya tiene perfil dentro del sistema.",
    };
  }

  if (status === "member-updated") {
    return {
      tone: "success" as const,
      message:
        "La configuracion del miembro fue actualizada y la ruta /admin ya fue revalidada.",
    };
  }

  if (status === "membership-extended") {
    return {
      tone: "success" as const,
      message:
        "La membresia fue extendida por un ano a partir de la fecha vigente o de hoy.",
    };
  }

  if (status === "book-created") {
    return {
      tone: "success" as const,
      message:
        "El libro fue creado correctamente y ya forma parte del catalogo interno.",
    };
  }

  if (status === "book-updated") {
    return {
      tone: "success" as const,
      message:
        "Los datos del libro fueron actualizados y la ruta /admin ya fue revalidada.",
    };
  }

  if (!error) {
    return null;
  }

  const errorMessages: Record<string, string> = {
    "invalid-full-name": "Debes indicar un nombre completo valido.",
    "invalid-email": "Debes indicar un correo electronico valido.",
    "invalid-password":
      "La contrasena debe tener al menos 8 caracteres para crear la cuenta.",
    "invalid-role": "El rol recibido no es valido.",
    "invalid-membership-date":
      "La fecha de membresia no es valida. Usa una fecha del calendario.",
    "email-already-exists":
      "Ya existe una cuenta con ese correo electronico en Supabase Auth.",
    "member-not-found": "No pudimos encontrar el miembro solicitado.",
    "cannot-demote-yourself":
      "No puedes quitarte a ti mismo el rol admin desde esta base de gestion.",
    "invalid-book-title": "Debes indicar un titulo de libro valido.",
    "invalid-book-author": "Debes indicar un autor valido.",
    "invalid-book-synopsis": "Debes indicar una sinopsis valida para el libro.",
    "invalid-book-cover-image-url":
      "La portada debe ser una URL valida con protocolo http o https.",
    "book-not-found": "No pudimos encontrar el libro solicitado.",
  };

  return {
    tone: "error" as const,
    message:
      errorMessages[error] ??
      "Ocurrio un error inesperado durante la operacion administrativa.",
  };
}

function formatDateLabel(isoDate: string): string {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "medium",
  }).format(new Date(isoDate));
}

function formatDateTimeLabel(isoDate: string | null): string {
  if (!isoDate) {
    return "Nunca";
  }

  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await requireAdmin();
  const resolvedSearchParams = await searchParams;
  const feedback = getFeedbackMessage(resolvedSearchParams);
  const members = await listAdminMembers();
  const books = await listAdminBooks();
  const defaultMembershipDate = getDefaultMembershipDateInput();

  return (
    <main className="flex flex-1 bg-stone-100 px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-8 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
              Administracion
            </p>
            <h1 className="text-3xl font-semibold text-stone-900">
              Panel interno
            </h1>
            <p className="max-w-2xl text-base leading-7 text-stone-700">
              Hola, {session.profile.full_name}. Esta base administrativa ya
              puede crear usuarios manualmente y gestionar membresias sin
              exponer credenciales privilegiadas al navegador.
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
            >
              Cerrar sesion
            </button>
          </form>
        </header>

        {feedback ? (
          <section
            className={`rounded-lg border p-5 shadow-sm ${
              feedback.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : "border-rose-200 bg-rose-50 text-rose-950"
            }`}
          >
            <p className="text-base leading-7">{feedback.message}</p>
          </section>
        ) : null}

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <article className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
            <div className="space-y-3">
              <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
                Backend foundation
              </p>
              <h2 className="text-2xl font-semibold text-stone-900">
                Crear cuenta manual
              </h2>
              <p className="text-base leading-7 text-stone-700">
                Este formulario crea el usuario en Supabase Auth usando
                service-role solo en el servidor y luego crea su fila en{" "}
                <code>public.profiles</code>.
              </p>
            </div>

            <form action={createMemberAction} className="mt-8 grid gap-5">
              <label className="grid gap-2 text-sm font-medium text-stone-800">
                Nombre completo
                <input
                  type="text"
                  name="full_name"
                  required
                  className="rounded-md border border-stone-300 px-4 py-3 text-base text-stone-900"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-stone-800">
                Correo electronico
                <input
                  type="email"
                  name="email"
                  required
                  className="rounded-md border border-stone-300 px-4 py-3 text-base text-stone-900"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-stone-800">
                Contrasena temporal
                <input
                  type="password"
                  name="password"
                  minLength={8}
                  required
                  className="rounded-md border border-stone-300 px-4 py-3 text-base text-stone-900"
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-stone-800">
                  Rol inicial
                  <select
                    name="role"
                    defaultValue="member"
                    className="rounded-md border border-stone-300 px-4 py-3 text-base text-stone-900"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-800">
                  Vencimiento de membresia
                  <input
                    type="date"
                    name="membership_date"
                    defaultValue={defaultMembershipDate}
                    required
                    className="rounded-md border border-stone-300 px-4 py-3 text-base text-stone-900"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="rounded-md bg-stone-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-stone-800"
              >
                Crear cuenta y perfil
              </button>
            </form>
          </article>

          <article className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
            <div className="space-y-3">
              <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
                Member management
              </p>
              <h2 className="text-2xl font-semibold text-stone-900">
                Miembros actuales
              </h2>
              <p className="text-base leading-7 text-stone-700">
                La tabla permite ajustar rol y fecha de vencimiento o extender
                la membresia un ano, manteniendo toda la mutacion en Server
                Actions.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              {members.map((member) => (
                <section
                  key={member.id}
                  className="rounded-lg border border-stone-200 bg-stone-50 p-5"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold text-stone-900">
                      {member.fullName}
                    </h3>
                    <p className="text-base text-stone-700">
                      {member.email ?? "Sin correo disponible"}
                    </p>
                    <p className="text-sm leading-6 text-stone-600">
                      Creado: {formatDateLabel(member.createdAt)}. Ultimo
                      acceso: {formatDateTimeLabel(member.lastSignInAt)}.
                    </p>
                  </div>

                  <form
                    action={updateMemberAction}
                    className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,180px)_minmax(0,220px)_auto]"
                  >
                    <input type="hidden" name="member_id" value={member.id} />

                    <label className="grid gap-2 text-sm font-medium text-stone-800">
                      Rol
                      <select
                        name="role"
                        defaultValue={member.role}
                        className="rounded-md border border-stone-300 bg-white px-4 py-3 text-base text-stone-900"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-stone-800">
                      Vence el
                      <input
                        type="date"
                        name="membership_date"
                        defaultValue={getMembershipDateInputValue(
                          member.membershipExpiresAt,
                        )}
                        required
                        className="rounded-md border border-stone-300 bg-white px-4 py-3 text-base text-stone-900"
                      />
                    </label>

                    <button
                      type="submit"
                      className="self-end rounded-md border border-stone-300 bg-white px-5 py-3 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
                    >
                      Guardar cambios
                    </button>
                  </form>

                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <p className="text-sm text-stone-700">
                      Vigente hasta{" "}
                      {formatDateLabel(member.membershipExpiresAt)}
                    </p>

                    <form action={extendMembershipAction}>
                      <input type="hidden" name="member_id" value={member.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
                      >
                        Extender 1 ano
                      </button>
                    </form>
                  </div>
                </section>
              ))}

              {members.length === 0 ? (
                <p className="text-base leading-7 text-stone-700">
                  Todavia no hay perfiles disponibles para administracion.
                </p>
              ) : null}
            </div>
          </article>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
              Books management
            </p>
            <h2 className="text-2xl font-semibold text-stone-900">
              Catalogo interno de libros
            </h2>
            <p className="text-base leading-7 text-stone-700">
              Esta base permite cargar y editar libros manualmente desde el
              panel admin usando Server Actions y las politicas RLS ya vigentes.
            </p>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <article className="rounded-lg border border-stone-200 bg-stone-50 p-6">
              <h3 className="text-xl font-semibold text-stone-900">
                Crear libro
              </h3>

              <form action={createBookAction} className="mt-6 grid gap-5">
                <label className="grid gap-2 text-sm font-medium text-stone-800">
                  Titulo
                  <input
                    type="text"
                    name="title"
                    required
                    className="rounded-md border border-stone-300 bg-white px-4 py-3 text-base text-stone-900"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-800">
                  Autor
                  <input
                    type="text"
                    name="author"
                    required
                    className="rounded-md border border-stone-300 bg-white px-4 py-3 text-base text-stone-900"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-800">
                  URL de portada
                  <input
                    type="url"
                    name="cover_image_url"
                    required
                    className="rounded-md border border-stone-300 bg-white px-4 py-3 text-base text-stone-900"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-800">
                  Sinopsis
                  <textarea
                    name="synopsis"
                    rows={6}
                    required
                    className="rounded-md border border-stone-300 bg-white px-4 py-3 text-base text-stone-900"
                  />
                </label>

                <button
                  type="submit"
                  className="rounded-md bg-stone-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-stone-800"
                >
                  Guardar libro
                </button>
              </form>
            </article>

            <article className="space-y-5">
              {books.map((book) => (
                <section
                  key={book.id}
                  className="rounded-lg border border-stone-200 bg-stone-50 p-6"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold text-stone-900">
                      {book.title}
                    </h3>
                    <p className="text-base text-stone-700">
                      {book.author} · Creado el{" "}
                      {formatDateLabel(book.createdAt)}
                    </p>
                  </div>

                  <form action={updateBookAction} className="mt-6 grid gap-5">
                    <input type="hidden" name="book_id" value={book.id} />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium text-stone-800">
                        Titulo
                        <input
                          type="text"
                          name="title"
                          defaultValue={book.title}
                          required
                          className="rounded-md border border-stone-300 bg-white px-4 py-3 text-base text-stone-900"
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-medium text-stone-800">
                        Autor
                        <input
                          type="text"
                          name="author"
                          defaultValue={book.author}
                          required
                          className="rounded-md border border-stone-300 bg-white px-4 py-3 text-base text-stone-900"
                        />
                      </label>
                    </div>

                    <label className="grid gap-2 text-sm font-medium text-stone-800">
                      URL de portada
                      <input
                        type="url"
                        name="cover_image_url"
                        defaultValue={book.coverImageUrl}
                        required
                        className="rounded-md border border-stone-300 bg-white px-4 py-3 text-base text-stone-900"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-medium text-stone-800">
                      Sinopsis
                      <textarea
                        name="synopsis"
                        rows={5}
                        defaultValue={book.synopsis}
                        required
                        className="rounded-md border border-stone-300 bg-white px-4 py-3 text-base text-stone-900"
                      />
                    </label>

                    <button
                      type="submit"
                      className="justify-self-start rounded-md border border-stone-300 bg-white px-5 py-3 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
                    >
                      Actualizar libro
                    </button>
                  </form>
                </section>
              ))}

              {books.length === 0 ? (
                <p className="rounded-lg border border-stone-200 bg-stone-50 p-6 text-base leading-7 text-stone-700">
                  Todavia no hay libros cargados para administracion.
                </p>
              ) : null}
            </article>
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-stone-900">
            Siguiente paso sugerido
          </h2>
          <p className="mt-4 text-base leading-7 text-stone-700">
            Con esta base ya podemos seguir con la gestion manual de coloquios
            usando libros reales del sistema como fuente de relacion.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="font-semibold text-stone-900 underline underline-offset-4"
            >
              Volver al inicio
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
