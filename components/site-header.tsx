import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

type HeaderActionTone = "primary" | "secondary" | "ghost" | "warm";

type HeaderFormAction = NonNullable<ComponentProps<"form">["action"]>;

type HeaderLinkAction = {
  kind: "link";
  href: string;
  label: string;
  tone: HeaderActionTone;
  external?: boolean;
};

type HeaderSubmitAction = {
  kind: "submit";
  action: HeaderFormAction;
  label: string;
  tone: HeaderActionTone;
};

type HeaderAction = HeaderLinkAction | HeaderSubmitAction;

type HeaderStatus = {
  title: string;
  tone?: "default" | "success" | "warning" | "error";
  content: ReactNode;
};

type SiteHeaderProps = {
  items: NavItem[];
  activeHref?: string;
  description?: string;
  status?: HeaderStatus;
  actions?: HeaderAction[];
};

const actionClassNames: Record<HeaderActionTone, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  warm: "btn-warm",
};

export function SiteHeader({
  items,
  activeHref,
  description,
  status,
  actions,
}: SiteHeaderProps) {
  const shouldBalanceNavRows = items.length % 2 === 1;
  const headerActions = actions ?? [];
  const buttonActions = headerActions.filter(
    (action) => action.tone !== "ghost",
  );
  const quietActions = headerActions.filter(
    (action) => action.tone === "ghost",
  );
  const hasSupplementalContent =
    status !== undefined || headerActions.length > 0;

  function renderAction(
    action: HeaderAction,
    className: string,
    keySuffix = "action",
  ) {
    const key = `${action.label}-${keySuffix}`;

    if (action.kind === "submit") {
      return (
        <form key={key} action={action.action} className="w-full sm:w-auto">
          <button type="submit" className={className}>
            {action.label}
          </button>
        </form>
      );
    }

    if (action.external) {
      return (
        <a
          key={key}
          href={action.href}
          target="_blank"
          rel="noreferrer"
          className={className}
        >
          {action.label}
        </a>
      );
    }

    return (
      <Link key={key} href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }

  return (
    <header
      className="site-header"
      data-has-supplemental={hasSupplementalContent}
    >
      <div className="site-header-main">
        <div className="site-header-brand">
          <BrandLogo size="sm" />
          <div className="min-w-0 space-y-1">
            <Link href="/" className="inline-flex">
              <span className="text-[22px] leading-[1.2] font-semibold [text-wrap:balance] text-[var(--text-primary)]">
                Cafe Lectura
              </span>
            </Link>
            {description ? (
              <p className="meta-copy max-w-2xl">{description}</p>
            ) : null}
          </div>
        </div>

        <nav className="site-header-nav" aria-label="Navegación principal">
          {items.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-link justify-center sm:justify-start",
                shouldBalanceNavRows &&
                  index === items.length - 1 &&
                  "col-span-2 sm:col-auto",
              )}
              data-active={item.href === activeHref}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="site-header-rail">
        {status ? (
          <div
            className="site-header-status"
            data-tone={status.tone ?? "default"}
            role="status"
          >
            <p className="site-header-status-title">{status.title}</p>
            <div className="site-header-status-copy">{status.content}</div>
          </div>
        ) : null}

        {buttonActions.length > 0 || quietActions.length > 0 ? (
          <div className="site-header-action-row">
            {buttonActions.length > 0 ? (
              <div className="site-header-actions">
                {buttonActions.map((action) =>
                  renderAction(
                    action,
                    cn(
                      actionClassNames[action.tone],
                      "w-full sm:w-auto lg:min-w-0",
                    ),
                  ),
                )}
              </div>
            ) : null}

            {quietActions.length > 0 ? (
              <div className="site-header-quiet-actions">
                {quietActions.map((action) =>
                  renderAction(
                    action,
                    "site-header-quiet-action w-full sm:w-auto",
                    "quiet",
                  ),
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {!hasSupplementalContent ? (
          <div className="hidden lg:block" aria-hidden="true" />
        ) : null}
      </div>
    </header>
  );
}

export type { HeaderAction, HeaderActionTone, HeaderStatus };
