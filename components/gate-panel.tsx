import type { ReactNode } from "react";

type GatePanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function GatePanel({
  eyebrow,
  title,
  description,
  children,
  footer,
}: GatePanelProps) {
  return (
    <section className="surface-card mx-auto w-full max-w-[560px] px-6 py-7 md:px-8 md:py-9">
      <div className="space-y-3">
        <div className="accent-rule mb-5" />
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="section-title text-[var(--text-primary)]">{title}</h1>
        <p className="body-copy">{description}</p>
      </div>

      <div className="mt-8 space-y-5">{children}</div>

      {footer ? (
        <div className="mt-7 border-t border-[var(--border-default)] pt-6">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
