import type { LucideIcon } from "lucide-react";
import {
  BookOpenTextIcon,
  LayoutDashboardIcon,
  LibraryBigIcon,
  UsersIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Panel",
    icon: LayoutDashboardIcon,
  },
  {
    href: "/admin/members",
    label: "Miembros",
    icon: UsersIcon,
  },
  {
    href: "/admin/books",
    label: "Libros",
    icon: LibraryBigIcon,
  },
  {
    href: "/admin/colloquiums",
    label: "Coloquios",
    icon: BookOpenTextIcon,
  },
];

export type AdminRouteContext = {
  title: string;
  description: string;
  breadcrumbs: Array<{
    label: string;
    href?: string;
  }>;
};

export function getAdminRouteContext(pathname: string): AdminRouteContext {
  if (pathname === "/admin") {
    return {
      title: "Panel administrativo",
      description: "Resumen operativo del sistema y accesos rápidos.",
      breadcrumbs: [{ label: "Panel" }],
    };
  }

  if (pathname.startsWith("/admin/members")) {
    if (pathname === "/admin/members/new") {
      return {
        title: "Nueva cuenta",
        description: "Alta manual de miembros y administradores.",
        breadcrumbs: [
          { label: "Panel", href: "/admin" },
          { label: "Miembros", href: "/admin/members" },
          { label: "Nueva cuenta" },
        ],
      };
    }

    return {
      title: "Miembros",
      description: "Listado, edición de rol y control de vigencia.",
      breadcrumbs: [{ label: "Panel", href: "/admin" }, { label: "Miembros" }],
    };
  }

  if (pathname.startsWith("/admin/books")) {
    if (pathname === "/admin/books/new") {
      return {
        title: "Nuevo libro",
        description: "Alta manual de una nueva entrada del catálogo.",
        breadcrumbs: [
          { label: "Panel", href: "/admin" },
          { label: "Libros", href: "/admin/books" },
          { label: "Nuevo libro" },
        ],
      };
    }

    return {
      title: "Libros",
      description:
        "Listado y gestión del catálogo disponible en la biblioteca.",
      breadcrumbs: [{ label: "Panel", href: "/admin" }, { label: "Libros" }],
    };
  }

  if (pathname === "/admin/colloquiums") {
    return {
      title: "Coloquios",
      description:
        "Vista editorial de borradores, publicaciones y accesos rápidos.",
      breadcrumbs: [{ label: "Panel", href: "/admin" }, { label: "Coloquios" }],
    };
  }

  if (pathname === "/admin/colloquiums/new") {
    return {
      title: "Nuevo coloquio",
      description: "Primer paso para registrar el contenido editorial privado.",
      breadcrumbs: [
        { label: "Panel", href: "/admin" },
        { label: "Coloquios", href: "/admin/colloquiums" },
        { label: "Nuevo coloquio" },
      ],
    };
  }

  if (pathname.endsWith("/preview")) {
    return {
      title: "Previsualización",
      description: "Revisión interna del coloquio antes o después de publicar.",
      breadcrumbs: [
        { label: "Panel", href: "/admin" },
        { label: "Coloquios", href: "/admin/colloquiums" },
        { label: "Previsualización" },
      ],
    };
  }

  if (pathname.startsWith("/admin/colloquiums/")) {
    return {
      title: "Editor de coloquio",
      description: "Gestión editorial de participantes, bloques y publicación.",
      breadcrumbs: [
        { label: "Panel", href: "/admin" },
        { label: "Coloquios", href: "/admin/colloquiums" },
        { label: "Editor" },
      ],
    };
  }

  return {
    title: "Administración",
    description: "Área interna de gestión de Café Lectura.",
    breadcrumbs: [{ label: "Panel", href: "/admin" }],
  };
}
