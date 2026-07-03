import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
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
      <div className="section-heading-copy space-y-0">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className={`${titleClassName} mt-3 text-[var(--text-primary)]`}>
          {title}
        </h2>
        <p className="body-large section-heading-description mt-4">
          {description}
        </p>
      </div>
      {action ? <div className="section-heading-action">{action}</div> : null}
    </div>
  );
}
