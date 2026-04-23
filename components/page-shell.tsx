import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  width?: "wide" | "regular" | "reading";
};

export function PageShell({ children, width = "wide" }: PageShellProps) {
  const widthClass =
    width === "reading"
      ? "page-container page-container-reading"
      : width === "regular"
        ? "page-container page-container-regular"
        : "page-container";

  return (
    <main className="page-shell">
      <div className={widthClass}>{children}</div>
    </main>
  );
}
