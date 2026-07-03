"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SpotlightCardSlotProps = {
  children: ReactNode;
  className?: string;
};

export function SpotlightCardSlot({
  children,
  className,
}: SpotlightCardSlotProps) {
  return <div className={cn(className)}>{children}</div>;
}
