"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, LogOutIcon } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import { adminNavItems } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logoutAction } from "@/lib/auth/actions";

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-4">
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-[14px] px-2 py-2 transition-colors outline-none hover:bg-[color:color-mix(in_srgb,var(--surface-subtle)_72%,white)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)]"
        >
          <BrandLogo size="sm" className="border-[var(--border-default)]" />
          <div className={open ? "min-w-0" : "hidden"}>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase">
              Café Lectura
            </p>
            <p className="mt-1 text-[15px] font-semibold text-[var(--text-primary)]">
              Panel administrativo
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span className={open ? "truncate" : "sr-only"}>
                          {item.label}
                        </span>
                        {open ? (
                          <ChevronRightIcon className="ml-auto size-4 text-[var(--text-muted)]" />
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="space-y-3">
        <div
          className={
            open
              ? "rounded-[14px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_70%,white)] px-3 py-3"
              : "hidden"
          }
        >
          <p className="text-[12px] font-semibold tracking-[0.16em] text-[var(--text-muted)] uppercase">
            Sesión activa
          </p>
          <p className="mt-2 text-[15px] font-semibold text-[var(--text-primary)]">
            {userName}
          </p>
        </div>

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            className={open ? "w-full justify-start" : "w-full justify-center"}
          >
            <LogOutIcon />
            <span className={open ? "" : "sr-only"}>Cerrar sesión</span>
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
