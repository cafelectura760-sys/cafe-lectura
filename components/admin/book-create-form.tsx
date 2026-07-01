import Link from "next/link";

import { createBookAction } from "@/lib/admin/book-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inputClassName =
  "h-11 w-full rounded-lg border border-[var(--border-default)] bg-white px-3 text-sm text-[var(--text-primary)] outline-none transition-[border-color,box-shadow] focus-visible:border-[var(--focus-ring-color)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]/25";

export function BookCreateForm() {
  return (
    <Card className="border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_96%,white)] shadow-[0_18px_40px_rgba(31,26,23,0.05)]">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <CardDescription className="tracking-[0.08em] uppercase">
            Alta manual
          </CardDescription>
          <CardTitle>Crear libro</CardTitle>
          <CardDescription className="mt-2 max-w-2xl">
            Añade una nueva entrada al catálogo que luego podrá usarse tanto en
            la biblioteca pública como en la relación editorial de coloquios.
          </CardDescription>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/books">Volver al listado</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <form action={createBookAction} className="grid gap-4 lg:grid-cols-2">
          <input type="hidden" name="redirect_to" value="/admin/books/new" />
          <input
            type="hidden"
            name="success_redirect_to"
            value="/admin/books"
          />

          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              type="text"
              name="title"
              required
              className={inputClassName}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="author">Autor</Label>
            <Input
              id="author"
              type="text"
              name="author"
              required
              className={inputClassName}
            />
          </div>

          <div className="grid gap-2 lg:col-span-2">
            <Label htmlFor="cover_image_url">URL de portada</Label>
            <Input
              id="cover_image_url"
              type="url"
              name="cover_image_url"
              required
              className={inputClassName}
            />
          </div>

          <div className="grid gap-2 lg:col-span-2">
            <Label htmlFor="synopsis">Sinopsis</Label>
            <Textarea
              id="synopsis"
              name="synopsis"
              rows={5}
              required
              className="min-h-32 text-sm"
            />
          </div>

          <div className="lg:col-span-2">
            <Button type="submit">Guardar libro</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
