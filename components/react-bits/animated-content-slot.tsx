"use client";

import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type AnimatedContentSlotProps = {
  children: ReactNode;
  className?: string;
  delay?: 0 | 1 | 2;
  as?: ElementType;
};

export function AnimatedContentSlot({
  children,
  className,
  delay = 0,
  as,
}: AnimatedContentSlotProps) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "reveal-soft",
        delay === 1 && "reveal-soft-delay-1",
        delay === 2 && "reveal-soft-delay-2",
        className,
      )}
    >
      {children}
    </Component>
  );
}
