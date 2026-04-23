import type { ReactNode } from "react";

type SectionTone = "default" | "moderator" | "participant";

type MarkdownBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    };

type MarkdownSection = {
  heading: string | null;
  tone: SectionTone;
  blocks: MarkdownBlock[];
};

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function getHeadingTone(value: string): SectionTone {
  const normalizedValue = value.toLowerCase();

  if (
    normalizedValue.includes("moderador") ||
    normalizedValue.includes("moderadora")
  ) {
    return "moderator";
  }

  if (
    normalizedValue.includes("participante") ||
    normalizedValue.includes("participantes")
  ) {
    return "participant";
  }

  return "default";
}

function splitInlineMarkdown(text: string): ReactNode[] {
  const pattern = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  const fragments: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      fragments.push(text.slice(lastIndex, match.index));
    }

    const [fullMatch, , linkLabel, linkHref, boldText, italicText] = match;

    if (linkLabel && linkHref) {
      let safeHref: string | null = null;

      try {
        const parsedUrl = new URL(linkHref);

        if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
          safeHref = parsedUrl.toString();
        }
      } catch {
        safeHref = null;
      }

      fragments.push(
        safeHref ? (
          <a
            key={`${match.index}-${fullMatch}`}
            href={safeHref}
            target="_blank"
            rel="noreferrer"
            className="editorial-link"
          >
            {linkLabel}
          </a>
        ) : (
          linkLabel
        ),
      );
    } else if (boldText) {
      fragments.push(
        <strong key={`${match.index}-${fullMatch}`} className="font-semibold">
          {boldText}
        </strong>,
      );
    } else if (italicText) {
      fragments.push(
        <em key={`${match.index}-${fullMatch}`} className="italic">
          {italicText}
        </em>,
      );
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    fragments.push(text.slice(lastIndex));
  }

  return fragments.length > 0 ? fragments : [text];
}

function parseMarkdownSections(markdown: string): MarkdownSection[] {
  const lines = normalizeLineEndings(markdown).split("\n");
  const sections: MarkdownSection[] = [];
  let currentSection: MarkdownSection = {
    heading: null,
    tone: "default",
    blocks: [],
  };
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    const text = paragraphLines.join(" ").trim();

    if (text) {
      currentSection.blocks.push({
        type: "paragraph",
        text,
      });
    }

    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length > 0) {
      currentSection.blocks.push({
        type: "list",
        items: [...listItems],
      });
    }

    listItems = [];
  };

  const flushSection = () => {
    flushParagraph();
    flushList();

    if (currentSection.heading || currentSection.blocks.length > 0) {
      sections.push(currentSection);
    }
  };

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(trimmedLine);

    if (headingMatch) {
      flushSection();
      currentSection = {
        heading: headingMatch[2].trim(),
        tone: getHeadingTone(headingMatch[2].trim()),
        blocks: [],
      };
      continue;
    }

    if (/^[-*]\s+/.test(trimmedLine)) {
      flushParagraph();
      listItems.push(trimmedLine.replace(/^[-*]\s+/, "").trim());
      continue;
    }

    flushList();
    paragraphLines.push(trimmedLine);
  }

  flushSection();

  return sections.length > 0 ? sections : [currentSection];
}

export function renderSafeMarkdown(markdown: string): ReactNode {
  const sections = parseMarkdownSections(markdown);

  return sections.map((section, sectionIndex) => (
    <section
      key={`${section.heading ?? "section"}-${sectionIndex}`}
      className="reader-section"
      data-tone={section.tone}
    >
      {section.heading ? (
        <h2 className="subsection-title text-[var(--text-primary)]">
          {section.heading}
        </h2>
      ) : null}

      <div className={section.heading ? "mt-4 space-y-4" : "space-y-4"}>
        {section.blocks.map((block, blockIndex) => {
          if (block.type === "paragraph") {
            return (
              <p
                key={`paragraph-${blockIndex}`}
                className="text-[17px] leading-[1.85] text-[var(--text-primary)] md:text-[18px]"
              >
                {splitInlineMarkdown(block.text)}
              </p>
            );
          }

          return (
            <ul
              key={`list-${blockIndex}`}
              className="space-y-3 pl-6 text-[17px] leading-[1.8] text-[var(--text-primary)] md:text-[18px]"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`item-${itemIndex}`} className="list-disc">
                  {splitInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          );
        })}
      </div>
    </section>
  ));
}
