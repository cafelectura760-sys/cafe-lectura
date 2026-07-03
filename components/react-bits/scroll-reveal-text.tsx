"use client";

import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ScrollRevealTextProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export function ScrollRevealText({
  children,
  className,
  as,
}: ScrollRevealTextProps) {
  const Component = as ?? "p";

  return (
    <Component className={cn("scroll-reveal", className)}>{children}</Component>
  );
}
