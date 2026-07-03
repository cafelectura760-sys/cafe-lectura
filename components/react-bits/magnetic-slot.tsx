"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MagneticSlotProps = {
  children: ReactNode;
  className?: string;
};

export function MagneticSlot({ children, className }: MagneticSlotProps) {
  return (
    <span className={cn("inline-flex max-w-full", className)}>{children}</span>
  );
}
