"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type BorderGlowSlotProps = {
  children: ReactNode;
  className?: string;
};

export function BorderGlowSlot({ children, className }: BorderGlowSlotProps) {
  return <div className={cn(className)}>{children}</div>;
}
