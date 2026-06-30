import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";

type PageShellProps = {
  children: ReactNode;
  width?: "wide" | "regular" | "reading";
  footer?: "club" | "none";
};

export function PageShell({
  children,
  width = "wide",
  footer = "club",
}: PageShellProps) {
  const widthClass =
    width === "reading"
      ? "page-container page-container-reading"
      : width === "regular"
        ? "page-container page-container-regular"
        : "page-container";

  return (
    <main className="page-shell">
      <div className={widthClass}>
        {children}
        {footer === "club" ? <SiteFooter /> : null}
      </div>
    </main>
  );
}
