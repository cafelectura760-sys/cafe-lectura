import Link from "next/link";

import { DeleteBookDialog } from "@/components/admin/delete-book-dialog";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  updateBookAction,
  updateBookStatusAction,
} from "@/lib/admin/book-actions";
import type { AdminBookRecord } from "@/lib/admin/book-management";
import type { AdminPaginatedResult } from "@/lib/admin/ui";
import { formatDateLabel } from "@/lib/admin/ui";

const inputClassName =
  "h-11 w-full rounded-lg border border-[var(--border-default)] bg-white px-3 text-sm text-[var(--text-primary)] outline-none transition-[border-color,box-shadow] focus-visible:border-[var(--focus-ring-color)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]/25";

function BookStatusBadge({ status }: { status: AdminBookRecord["status"] }) {
  return status === "published" ? (
    <Badge className="bg-emerald-100 text-emerald-900">Publicado</Badge>
  ) : (
    <Badge className="bg-amber-100 text-amber-900">Oculto</Badge>
  );
}

function BookVisibilityAction({
  book,
  currentPath,
}: {
  book: AdminBookRecord;
  currentPath: string;
}) {
  const nextStatus = book.status === "published" ? "hidden" : "published";

  return (
    <form action={updateBookStatusAction}>
      <input type="hidden" name="redirect_to" value={currentPath} />
      <input type="hidden" name="book_id" value={book.id} />
      <input type="hidden" name="status" value={nextStatus} />
      <Button type="submit" size="sm" variant="secondary">
        {book.status === "published" ? "Ocultar en biblioteca" : "Publicar"}
      </Button>
    </form>
  );
}

function BookDeleteAction({
  book,
  currentPath,
}: {
  book: AdminBookRecord;
  currentPath: string;
}) {
  const isDeleteDisabled = book.linkedColloquiumCount > 0;

  return (
    <DeleteBookDialog
      bookId={book.id}
      title={book.title}
      redirectTo={currentPath}
      disabled={isDeleteDisabled}
      disabledReason={
        isDeleteDisabled
          ? "No se puede eliminar porque tiene coloquios vinculados."
          : undefined
      }
    />
  );
}

export function BooksManagement({
  booksPage,
  currentPath,
}: {
  booksPage: AdminPaginatedResult<AdminBookRecord>;
  currentPath: string;
}) {
  const books = booksPage.items;

  return (
    <>
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.16em] text-[var(--text-muted)] uppercase">
            Gestión de catálogo
          </p>
          <h2 className="mt-2 text-[28px] font-semibold text-[var(--text-primary)]">
            Libros
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
            Mantén el catálogo editorial disponible para la biblioteca pública y
            para la relación con los coloquios.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/books/new">Crear libro</Link>
        </Button>
      </section>

      <section>
        <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_96%,white)] shadow-[0_18px_40px_rgba(31,26,23,0.05)]">
          <CardHeader>
            <CardDescription className="tracking-[0.08em] uppercase">
              Catálogo
            </CardDescription>
            <CardTitle>Libros cargados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {books.length === 0 ? (
              <p className="text-sm leading-7 text-[var(--text-secondary)]">
                Todavía no hay libros cargados para administración.
              </p>
            ) : (
              <>
                <div className="hidden xl:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Libro</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Creado</TableHead>
                        <TableHead>Coloquios</TableHead>
                        <TableHead className="w-[560px]">Edición</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell className="align-top">
                            <div className="space-y-1 whitespace-normal">
                              <p className="font-semibold text-[var(--text-primary)]">
                                {book.title}
                              </p>
                              <p className="text-sm text-[var(--text-secondary)]">
                                {book.author}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="align-top">
                            <BookStatusBadge status={book.status} />
                          </TableCell>
                          <TableCell className="align-top text-sm text-[var(--text-secondary)]">
                            {formatDateLabel(book.createdAt)}
                          </TableCell>
                          <TableCell className="align-top text-sm text-[var(--text-secondary)]">
                            {book.linkedColloquiumCount}
                          </TableCell>
                          <TableCell className="align-top">
                            <div className="grid gap-3">
                              <form
                                action={updateBookAction}
                                className="grid gap-3"
                              >
                                <input
                                  type="hidden"
                                  name="redirect_to"
                                  value={currentPath}
                                />
                                <input
                                  type="hidden"
                                  name="book_id"
                                  value={book.id}
                                />
                                <div className="grid gap-3 md:grid-cols-2">
                                  <input
                                    type="text"
                                    name="title"
                                    defaultValue={book.title}
                                    required
                                    className={inputClassName}
                                  />
                                  <input
                                    type="text"
                                    name="author"
                                    defaultValue={book.author}
                                    required
                                    className={inputClassName}
                                  />
                                </div>
                                <input
                                  type="url"
                                  name="cover_image_url"
                                  defaultValue={book.coverImageUrl}
                                  required
                                  className={inputClassName}
                                />
                                <textarea
                                  name="synopsis"
                                  rows={4}
                                  defaultValue={book.synopsis}
                                  required
                                  className="min-h-28 w-full rounded-lg border border-[var(--border-default)] bg-white px-3 py-3 text-sm text-[var(--text-primary)] transition-[border-color,box-shadow] outline-none focus-visible:border-[var(--focus-ring-color)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]/25"
                                />
                                <div>
                                  <Button type="submit" variant="outline">
                                    Actualizar libro
                                  </Button>
                                </div>
                              </form>
                              <div className="flex flex-wrap items-center gap-2">
                                <BookVisibilityAction
                                  book={book}
                                  currentPath={currentPath}
                                />
                                <BookDeleteAction
                                  book={book}
                                  currentPath={currentPath}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-4 xl:hidden">
                  {books.map((book) => (
                    <Card
                      key={book.id}
                      size="sm"
                      className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_72%,white)] shadow-none"
                    >
                      <CardContent className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-[var(--text-primary)]">
                              {book.title}
                            </h3>
                            <BookStatusBadge status={book.status} />
                          </div>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {book.author}
                          </p>
                          <p className="text-xs leading-6 text-[var(--text-muted)]">
                            Creado: {formatDateLabel(book.createdAt)} ·
                            Coloquios vinculados: {book.linkedColloquiumCount}
                          </p>
                        </div>

                        <form action={updateBookAction} className="grid gap-3">
                          <input
                            type="hidden"
                            name="redirect_to"
                            value={currentPath}
                          />
                          <input type="hidden" name="book_id" value={book.id} />
                          <input
                            type="text"
                            name="title"
                            defaultValue={book.title}
                            required
                            className={inputClassName}
                          />
                          <input
                            type="text"
                            name="author"
                            defaultValue={book.author}
                            required
                            className={inputClassName}
                          />
                          <input
                            type="url"
                            name="cover_image_url"
                            defaultValue={book.coverImageUrl}
                            required
                            className={inputClassName}
                          />
                          <textarea
                            name="synopsis"
                            rows={4}
                            defaultValue={book.synopsis}
                            required
                            className="min-h-28 w-full rounded-lg border border-[var(--border-default)] bg-white px-3 py-3 text-sm text-[var(--text-primary)] transition-[border-color,box-shadow] outline-none focus-visible:border-[var(--focus-ring-color)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]/25"
                          />
                          <div>
                            <Button type="submit" variant="outline">
                              Actualizar libro
                            </Button>
                          </div>
                        </form>
                        <div className="flex flex-wrap items-center gap-2">
                          <BookVisibilityAction
                            book={book}
                            currentPath={currentPath}
                          />
                          <BookDeleteAction
                            book={book}
                            currentPath={currentPath}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <AdminPagination
                  basePath="/admin/books"
                  pagination={booksPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
