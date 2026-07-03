"use client";

import { useId, useState } from "react";

type ExpandableTextProps = {
  content: string;
};

function createCollapsedExcerpt(content: string): string {
  const normalizedContent = content.replace(/\s+/g, " ").trim();

  if (!normalizedContent) {
    return "";
  }

  if (normalizedContent.length <= 500) {
    return normalizedContent;
  }

  return `${normalizedContent.slice(0, 497).trim()}...`;
}

export function ExpandableText({ content }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = useId();
  const collapsedContent = createCollapsedExcerpt(content);

  return (
    <div className="space-y-3">
      <div
        id={contentId}
        className="rounded-[10px] border border-[var(--border-default)] bg-[color:color-mix(in_srgb,var(--surface-subtle)_72%,white)] px-4 py-4 text-[17px] leading-[1.8] whitespace-pre-line text-[var(--text-primary)]"
      >
        {isExpanded ? content.trim() : collapsedContent}
      </div>
      <button
        type="button"
        aria-controls={contentId}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((currentValue) => !currentValue)}
        className="btn-secondary"
      >
        {isExpanded ? "Mostrar menos" : "Leer intervención completa"}
      </button>
    </div>
  );
}
