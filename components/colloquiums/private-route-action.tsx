import Link from "next/link";
import { CircleAlertIcon, LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PrivateRouteAction({
  slug,
  status,
  size = "sm",
  variant = "outline",
  className,
}: {
  slug: string;
  status: "draft" | "published";
  size?:
    | "default"
    | "sm"
    | "xs"
    | "lg"
    | "icon"
    | "icon-xs"
    | "icon-sm"
    | "icon-lg";
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | "link";
  className?: string;
}) {
  if (status === "published") {
    return (
      <Button asChild size={size} variant={variant} className={className}>
        <Link href={`/colloquiums/${slug}`}>
          <LinkIcon data-icon="inline-start" />
          Ruta privada
        </Link>
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size={size} variant={variant} className={className}>
          <LinkIcon data-icon="inline-start" />
          Ruta privada
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <CircleAlertIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Ruta privada no disponible</AlertDialogTitle>
          <AlertDialogDescription>
            Este coloquio todavía está en borrador. La ruta privada solo se
            habilita cuando el coloquio ha sido publicado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Entendido</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
