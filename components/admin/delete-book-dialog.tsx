"use client";

import { Trash2, TriangleAlert } from "lucide-react";

import { deleteBookAction } from "@/lib/admin/book-actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DeleteBookDialogProps = {
  bookId: string;
  title: string;
  redirectTo: string;
  disabled?: boolean;
  disabledReason?: string;
};

export function DeleteBookDialog({
  bookId,
  title,
  redirectTo,
  disabled = false,
  disabledReason,
}: DeleteBookDialogProps) {
  if (disabled) {
    return (
      <span className="inline-flex" title={disabledReason}>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled
          aria-label={disabledReason ?? "Eliminación no disponible"}
        >
          <Trash2 />
        </Button>
      </span>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Eliminar el libro ${title}`}
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlert />
          </AlertDialogMedia>
          <AlertDialogTitle>Eliminar libro</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a eliminar de forma definitiva <strong>{title}</strong>. Esta
            acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <form action={deleteBookAction}>
            <input type="hidden" name="book_id" value={bookId} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <Button type="submit" variant="destructive">
              Sí, eliminar
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
