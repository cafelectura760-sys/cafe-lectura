import type { Metadata } from "next";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { DeleteColloquiumDialog } from "@/components/colloquiums/delete-colloquium-dialog";
import { createBookAction, updateBookAction } from "@/lib/admin/book-actions";
import {
  createMemberAction,
  extendMembershipAction,
  updateMemberAction,
} from "@/lib/admin/actions";
import { listAdminBooks } from "@/lib/admin/book-management";
import {
  getDefaultMembershipDateInput,
  getMembershipDateInputValue,
  listAdminMembers,
} from "@/lib/admin/member-management";
import { getAdminKeepAliveStatus } from "@/lib/admin/system-heartbeats";
import { logoutAction } from "@/lib/auth/actions";
import { requireAdmin } from "@/lib/auth/session";
import { listAdminColloquiums } from "@/lib/colloquiums/data";

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Administración | Cafe Lectura",
  description: "Área administrativa de Cafe Lectura.",
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
      message: "La configuración del miembro fue actualizada correctamente.",
    };
  }

  if (status === "membership-extended") {
    return {
      tone: "success" as const,
      message:
        "La membresía fue extendida por un año a partir de la fecha vigente o de hoy.",
    };
  }

  if (status === "book-created") {
    return {
      tone: "success" as const,
      message:
        "El libro fue creado correctamente y ya forma parte del catálogo interno.",
    };
  }

  if (status === "book-updated") {
    return {
      tone: "success" as const,
      message:
        "Los datos del libro fueron actualizados y ya están disponibles en el sistema.",
    };
  }

  if (status === "colloquium-deleted") {
    return {
      tone: "success" as const,
      message:
        "El coloquio fue eliminado por completo, junto con sus archivos privados asociados.",
    };
  }

  if (!error) {
    return null;
  }

  const errorMessages: Record<string, string> = {
    "invalid-full-name": "Debes indicar un nombre completo válido.",
    "invalid-email": "Debes indicar un correo electrónico válido.",
    "invalid-password":
      "La contraseña debe tener al menos 8 caracteres para crear la cuenta.",
    "invalid-role": "El rol recibido no es válido.",
    "invalid-membership-date":
      "La fecha de membresía no es válida. Usa una fecha del calendario.",
    "email-already-exists":
      "Ya existe una cuenta con ese correo electrónico en Supabase Auth.",
    "member-not-found": "No pudimos encontrar el miembro solicitado.",
    "cannot-demote-yourself":
      "No puedes quitarte a ti mismo el rol de administrador desde este panel.",
    "invalid-book-title": "Debes indicar un título de libro válido.",
    "invalid-book-author": "Debes indicar un autor válido.",
    "invalid-book-synopsis": "Debes indicar una sinopsis válida para el libro.",
    "invalid-book-cover-image-url":
      "La portada debe ser una URL válida con protocolo http o https.",
    "book-not-found": "No pudimos encontrar el libro solicitado.",
  };

  return {
    tone: "error" as const,
    message:
      errorMessages[error] ??
      "Ocurrió un error inesperado durante la operación administrativa.",
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

function getKeepAliveStatusLabel(status: "success" | "error" | "missing") {
  switch (status) {
    case "success":
      return "Activo";
    case "error":
      return "Con error";
    case "missing":
      return "Sin registro";
  }
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await requireAdmin();
  const resolvedSearchParams = await searchParams;
  const feedback = getFeedbackMessage(resolvedSearchParams);
  const [members, books, colloquiums, keepAliveStatus] = await Promise.all([
    listAdminMembers(),
    listAdminBooks(),
    listAdminColloquiums(),
    getAdminKeepAliveStatus(),
  ]);
  const defaultMembershipDate = getDefaultMembershipDateInput();

  return (
    <main className="flex flex-1 bg-stone-100 px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-8 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <BrandLogo
              size="sm"
              className="border-stone-200 bg-stone-50 shadow-none"
            />
            <div className="space-y-3">
              <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
                Administración
              </p>
              <h1 className="text-3xl font-semibold text-stone-900">
                Panel interno
              </h1>
              <p className="max-w-2xl text-base leading-7 text-stone-700">
                Hola, {session.profile.full_name}. Desde aquí puedes gestionar
                miembros, libros y el nuevo flujo editorial del módulo de
                coloquios.
              </p>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
            >
              Cerrar sesión
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

        <section
          className={`rounded-lg border p-6 shadow-sm ${
            keepAliveStatus.isStale
              ? "border-amber-200 bg-amber-50 text-amber-950"
              : "border-emerald-200 bg-emerald-50 text-emerald-950"
          }`}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium tracking-[0.18em] uppercase">
                Keep-alive de Supabase
              </p>
              <h2 className="text-2xl font-semibold">
                {keepAliveStatus.isStale
                  ? "Requiere atención"
                  : "Funcionando con normalidad"}
              </h2>
              <p className="text-base leading-7">
                {keepAliveStatus.lastSucceededAt
                  ? `Último keep-alive exitoso: ${formatDateTimeLabel(
                      keepAliveStatus.lastSucceededAt,
                    )}.`
                  : "Todavía no hay una ejecución exitosa registrada."}
              </p>
            </div>

            <div className="rounded-md border border-current/15 bg-white/60 px-4 py-3 text-sm leading-6">
              <p className="font-semibold">Job</p>
              <p>{keepAliveStatus.jobName}</p>
              <p className="mt-2 font-semibold">Estado</p>
              <p>{getKeepAliveStatusLabel(keepAliveStatus.lastStatus)}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <article className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
            <div className="space-y-3">
              <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
                Base técnica
              </p>
              <h2 className="text-2xl font-semibold text-stone-900">
                Crear cuenta manual
              </h2>
              <p className="text-base leading-7 text-stone-700">
                Este formulario crea el usuario en Supabase Auth usando
                credenciales privilegiadas solo en el servidor y luego crea su
                fila en <code>public.profiles</code>.
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
                Correo electrónico
                <input
                  type="email"
                  name="email"
                  required
                  className="rounded-md border border-stone-300 px-4 py-3 text-base text-stone-900"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-stone-800">
                Contraseña temporal
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
                    <option value="member">Miembro</option>
                    <option value="admin">Administrador</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium text-stone-800">
                  Vencimiento de membresía
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
                Gestión de miembros
              </p>
              <h2 className="text-2xl font-semibold text-stone-900">
                Miembros actuales
              </h2>
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
                      Creado: {formatDateLabel(member.createdAt)}. Último
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
                        <option value="member">Miembro</option>
                        <option value="admin">Administrador</option>
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
                        Extender 1 año
                      </button>
                    </form>
                  </div>
                </section>
              ))}

              {members.length === 0 ? (
                <p className="text-base leading-7 text-stone-700">
                  Todavía no hay perfiles disponibles para administración.
                </p>
              ) : null}
            </div>
          </article>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
              Gestión de libros
            </p>
            <h2 className="text-2xl font-semibold text-stone-900">
              Catálogo interno de libros
            </h2>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <article className="rounded-lg border border-stone-200 bg-stone-50 p-6">
              <h3 className="text-xl font-semibold text-stone-900">
                Crear libro
              </h3>

              <form action={createBookAction} className="mt-6 grid gap-5">
                <label className="grid gap-2 text-sm font-medium text-stone-800">
                  Título
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
                      {book.author}, creado el {formatDateLabel(book.createdAt)}
                    </p>
                  </div>

                  <form action={updateBookAction} className="mt-6 grid gap-5">
                    <input type="hidden" name="book_id" value={book.id} />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium text-stone-800">
                        Título
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
                  Todavía no hay libros cargados para administración.
                </p>
              ) : null}
            </article>
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-[0.18em] text-stone-500 uppercase">
              Gestión de coloquios
            </p>
            <h2 className="text-2xl font-semibold text-stone-900">
              Módulo estructurado de coloquios
            </h2>
            <p className="text-base leading-7 text-stone-700">
              La edición avanzada ahora vive en páginas dedicadas para metadata,
              secciones, aportes, media privada y preview de borradores.
            </p>
          </div>

          {books.length === 0 ? (
            <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6 text-base leading-7 text-amber-950">
              Primero necesitas al menos un libro en el catálogo para poder
              crear coloquios relacionados.
            </p>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/colloquiums/new" className="btn-primary">
                  Crear coloquio nuevo
                </Link>
                <p className="max-w-2xl text-base leading-7 text-stone-700">
                  Usa el editor dedicado para construir coloquios con secciones
                  ordenadas, intervenciones estructuradas, audios, imágenes y
                  preview privado.
                </p>
              </div>

              <article className="space-y-5">
                {colloquiums.map((colloquium) => (
                  <section
                    key={colloquium.id}
                    className="rounded-lg border border-stone-200 bg-stone-50 p-6"
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl font-semibold text-stone-900">
                        {colloquium.title}
                      </h3>
                      <p className="text-base text-stone-700">
                        {colloquium.bookTitle} · Estado:{" "}
                        {colloquium.status === "published"
                          ? "Publicado"
                          : "Borrador"}
                      </p>
                      <p className="text-sm leading-6 text-stone-600">
                        Slug: {colloquium.slug}. Secciones:{" "}
                        {colloquium.sectionCount}. Última actualización:{" "}
                        {formatDateTimeLabel(colloquium.updatedAt)}.
                      </p>
                      {colloquium.excerpt ? (
                        <p className="text-base leading-7 text-stone-700">
                          {colloquium.excerpt}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/admin/colloquiums/${colloquium.id}`}
                        className="rounded-md border border-stone-300 bg-white px-5 py-3 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
                      >
                        Abrir editor
                      </Link>
                      <Link
                        href={`/admin/colloquiums/${colloquium.id}/preview`}
                        className="rounded-md border border-stone-300 bg-white px-5 py-3 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
                      >
                        Previsualizar
                      </Link>
                      <Link
                        href={`/colloquiums/${colloquium.slug}`}
                        className="rounded-md border border-stone-300 bg-white px-5 py-3 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
                      >
                        Ruta privada
                      </Link>
                      <DeleteColloquiumDialog
                        colloquiumId={colloquium.id}
                        currentSlug={colloquium.slug}
                        redirectTo="/admin"
                        title={colloquium.title}
                        triggerLabel="Eliminar"
                        triggerClassName="h-12 px-5 text-base"
                      />
                    </div>
                  </section>
                ))}

                {colloquiums.length === 0 ? (
                  <p className="rounded-lg border border-stone-200 bg-stone-50 p-6 text-base leading-7 text-stone-700">
                    Todavía no hay coloquios cargados para administración.
                  </p>
                ) : null}
              </article>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
