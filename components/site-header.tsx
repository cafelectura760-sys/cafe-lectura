import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/brand-logo";

type NavItem = {
  href: string;
  label: string;
};

type SiteHeaderProps = {
  items: NavItem[];
  activeHref?: string;
  description?: string;
  actions?: ReactNode;
};

export function SiteHeader({
  items,
  activeHref,
  description,
  actions,
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center gap-4">
          <BrandLogo size="sm" />
          <div className="space-y-1">
            <Link href="/" className="inline-flex">
              <span className="text-[22px] leading-[1.2] font-semibold text-[var(--text-primary)]">
                Cafe Lectura
              </span>
            </Link>
            {description ? (
              <p className="meta-copy max-w-2xl">{description}</p>
            ) : null}
          </div>
        </div>

        <nav className="flex flex-wrap gap-2" aria-label="Navegacion principal">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              data-active={item.href === activeHref}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {actions ? (
        <div className="flex w-full min-w-0 flex-col gap-3 lg:w-auto lg:items-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
