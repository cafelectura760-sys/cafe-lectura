"use client";

import type { ReactNode } from "react";
import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  adminNavItems,
  getAdminRouteContext,
} from "@/components/admin/admin-nav";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

function AdminBreadcrumbs({ pathname }: { pathname: string }) {
  const context = getAdminRouteContext(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {context.breadcrumbs.map((crumb, index) => {
          const isLast = index === context.breadcrumbs.length - 1;

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function MobileAdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const currentContext = useMemo(
    () => getAdminRouteContext(pathname),
    [pathname],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="md:hidden"
        >
          <MenuIcon />
          <span className="sr-only">Abrir navegación</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0" showCloseButton={false}>
        <SheetHeader className="border-b border-[var(--border-default)] px-5 py-5">
          <SheetTitle>Panel administrativo</SheetTitle>
          <SheetDescription>{currentContext.description}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 px-5 py-5">
          <nav aria-label="Navegación administrativa">
            <ul className="flex flex-col gap-2">
              {adminNavItems.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={
                        active
                          ? "flex min-h-12 items-center gap-3 rounded-[14px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_78%,white)] px-4 text-[15px] font-semibold text-[var(--text-primary)]"
                          : "flex min-h-12 items-center gap-3 rounded-[14px] px-4 text-[15px] font-medium text-[var(--text-secondary)] hover:bg-[color:color-mix(in_srgb,var(--surface-subtle)_72%,white)] hover:text-[var(--text-primary)]"
                      }
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="rounded-[16px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_70%,white)] px-4 py-4">
            <p className="text-[12px] font-semibold tracking-[0.16em] text-[var(--text-muted)] uppercase">
              Sesión activa
            </p>
            <p className="mt-2 text-[15px] font-semibold text-[var(--text-primary)]">
              {userName}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AdminShell({
  children,
  userName,
}: {
  children: ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const routeContext = useMemo(
    () => getAdminRouteContext(pathname),
    [pathname],
  );

  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar userName={userName} />
      <SidebarInset className="h-screen min-h-0 bg-[color:color-mix(in_srgb,var(--background-page)_90%,white)]">
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_92%,white)]/95 backdrop-blur-md">
            <div className="flex min-h-[4.5rem] items-center gap-3 px-4 py-3 md:px-6">
              <MobileAdminNav userName={userName} />
              <SidebarTrigger className="hidden md:inline-flex" />

              <div className="min-w-0 flex-1">
                <AdminBreadcrumbs pathname={pathname} />
                <div className="mt-1">
                  <h1 className="truncate text-[19px] font-semibold text-[var(--text-primary)] md:text-[22px]">
                    {routeContext.title}
                  </h1>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
