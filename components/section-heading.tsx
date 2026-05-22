import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  titleClassName?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  titleClassName = "section-title",
}: SectionHeadingProps) {
  return (
    <div className="section-header">
      <div className="max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className={`${titleClassName} mt-3 text-[var(--text-primary)]`}>
          {title}
        </h2>
        <p className="body-large mt-4">{description}</p>
      </div>
      {action ? <div className="lg:pb-1">{action}</div> : null}
    </div>
  );
}
