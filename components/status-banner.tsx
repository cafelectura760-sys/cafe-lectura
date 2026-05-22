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
    <div className={`status-panel status-panel-${tone}`}>
      {title ? (
        <p className="text-[16px] font-semibold text-[var(--text-primary)]">
          {title}
        </p>
      ) : null}
      <div
        className={`${title ? "mt-2" : ""} text-[16px] leading-7 text-[var(--text-secondary)]`}
      >
        {children}
      </div>
    </div>
  );
}
