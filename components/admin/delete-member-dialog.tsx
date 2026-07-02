"use client";

import { Trash2, TriangleAlert } from "lucide-react";

import { deleteMemberAction } from "@/lib/admin/actions";
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

type DeleteMemberDialogProps = {
  memberId: string;
  memberName: string;
  redirectTo: string;
  disabled?: boolean;
  disabledReason?: string;
};

export function DeleteMemberDialog({
  memberId,
  memberName,
  redirectTo,
  disabled = false,
  disabledReason,
}: DeleteMemberDialogProps) {
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
          aria-label={`Eliminar a ${memberName}`}
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlert />
          </AlertDialogMedia>
          <AlertDialogTitle>Eliminar miembro</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a eliminar de forma definitiva la cuenta de{" "}
            <strong>{memberName}</strong>. Esta acción borrará también su perfil
            y no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <form action={deleteMemberAction}>
            <input type="hidden" name="member_id" value={memberId} />
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
