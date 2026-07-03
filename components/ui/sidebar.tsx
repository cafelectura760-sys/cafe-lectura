"use client";

import * as React from "react";
import { PanelLeftIcon } from "lucide-react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SidebarContextValue = {
  open: boolean;
  state: "expanded" | "collapsed";
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  children,
  defaultOpen = true,
  className,
}: React.PropsWithChildren<{
  defaultOpen?: boolean;
  className?: string;
}>) {
  const [open, setOpen] = React.useState(defaultOpen);
  const toggleSidebar = React.useCallback(() => {
    setOpen((current) => !current);
  }, []);

  const value = React.useMemo(
    () => ({
      open,
      state: open ? ("expanded" as const) : ("collapsed" as const),
      setOpen,
      toggleSidebar,
    }),
    [open, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <div
        data-slot="sidebar-wrapper"
        data-state={value.state}
        className={cn(
          "group/sidebar-wrapper flex h-screen w-full overflow-hidden",
          className,
        )}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  children,
  className,
}: React.PropsWithChildren<{
  className?: string;
}>) {
  const { open, state } = useSidebar();

  return (
    <aside
      data-slot="sidebar"
      data-state={state}
      className={cn(
        "hidden shrink-0 border-r border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-default)_94%,white)] shadow-[inset_-1px_0_0_rgba(31,26,23,0.03)] transition-[width] duration-200 md:sticky md:top-0 md:flex md:h-screen md:flex-col",
        open ? "md:w-72" : "md:w-[5.5rem]",
        className,
      )}
    >
      {children}
    </aside>
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("shrink-0", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Mostrar u ocultar navegación</span>
    </Button>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("border-b border-[var(--border-default)] p-3", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        "mt-auto border-t border-[var(--border-default)] p-3",
        className,
      )}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto p-3",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        "px-2 text-[11px] font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase group-data-[state=collapsed]/sidebar-wrapper:sr-only",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={isActive}
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded-[12px] px-3 text-left text-[15px] font-medium text-[var(--text-secondary)] transition-[background-color,color,box-shadow] outline-none group-data-[state=collapsed]/sidebar-wrapper:justify-center group-data-[state=collapsed]/sidebar-wrapper:px-0 hover:bg-[color:color-mix(in_srgb,var(--surface-subtle)_72%,white)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] data-[active=true]:bg-[color:color-mix(in_srgb,var(--surface-subtle)_78%,white)] data-[active=true]:text-[var(--text-primary)] data-[active=true]:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-casa)_12%,white)]",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      className={cn(
        "ml-5 flex flex-col gap-1 border-l border-[var(--border-default)] pl-3 group-data-[state=collapsed]/sidebar-wrapper:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      className={cn(className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "a";

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-active={isActive}
      className={cn(
        "flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-sm text-[var(--text-secondary)] transition-[background-color,color] outline-none hover:bg-[color:color-mix(in_srgb,var(--surface-subtle)_72%,white)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--focus-ring-color)] data-[active=true]:bg-[color:color-mix(in_srgb,var(--surface-subtle)_76%,white)] data-[active=true]:text-[var(--text-primary)]",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
