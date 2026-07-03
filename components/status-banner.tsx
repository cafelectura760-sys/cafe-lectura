import type { ReactNode } from "react";

type StatusTone = "default" | "success" | "warning" | "error";

type StatusBannerProps = {
  tone?: StatusTone;
  title?: string;
  children: ReactNode;
};

export function StatusBanner({
  tone = "default",
  title,
  children,
}: StatusBannerProps) {
  return (
    <div
      className={`status-panel status-panel-${tone}`}
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
    >
      {title ? (
        <p className="text-[16px] leading-6 font-semibold text-[var(--text-primary)]">
          {title}
        </p>
      ) : null}
      <div
        className={`${title ? "mt-2.5" : ""} text-[16px] leading-7 text-[var(--text-secondary)]`}
      >
        {children}
      </div>
    </div>
  );
}
