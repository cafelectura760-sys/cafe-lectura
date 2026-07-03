"use client";

import type { ReactNode } from "react";

import Magnet from "@/components/Magnet";
import { cn } from "@/lib/utils";

type MagneticSlotProps = {
  children: ReactNode;
  className?: string;
};

export function MagneticSlot({ children, className }: MagneticSlotProps) {
  const isInteractive =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!isInteractive) {
    return (
      <span className={cn("inline-flex max-w-full", className)}>
        {children}
      </span>
    );
  }

  return (
    <Magnet
      padding={56}
      magnetStrength={12}
      wrapperClassName={cn("inline-flex max-w-full", className)}
      innerClassName="inline-flex max-w-full"
    >
      {children}
    </Magnet>
  );
}
