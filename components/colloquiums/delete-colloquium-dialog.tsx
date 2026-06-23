"use client";

import { TriangleAlert } from "lucide-react";

import { deleteColloquiumAction } from "@/lib/colloquiums/actions";
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

type DeleteColloquiumDialogProps = {
  colloquiumId: string;
  currentSlug: string;
  redirectTo: string;
  title: string;
  triggerLabel?: string;
  triggerVariant?: "destructive" | "outline" | "secondary";
  triggerClassName?: string;
};

export function DeleteColloquiumDialog({
  colloquiumId,
  currentSlug,
  redirectTo,
  title,
  triggerLabel = "Eliminar coloquio",
  triggerVariant = "destructive",
  triggerClassName,
}: DeleteColloquiumDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          className={triggerClassName}
        >
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlert />
          </AlertDialogMedia>
          <AlertDialogTitle>Eliminar coloquio</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a eliminar de forma irreversible <strong>{title}</strong>, junto
            con sus secciones, intervenciones y archivos privados. Esta acción
            no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <form action={deleteColloquiumAction}>
            <input type="hidden" name="colloquium_id" value={colloquiumId} />
            <input type="hidden" name="current_slug" value={currentSlug} />
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
