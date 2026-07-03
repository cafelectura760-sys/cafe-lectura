"use client";

import type { ReactNode } from "react";

import BorderGlow from "@/components/BorderGlow";
import { cn } from "@/lib/utils";

type BorderGlowSlotProps = {
  children: ReactNode;
  className?: string;
  backgroundColor?: string;
};

export function BorderGlowSlot({
  children,
  className,
  backgroundColor = "color-mix(in srgb, var(--surface-default) 92%, white)",
}: BorderGlowSlotProps) {
  return (
    <BorderGlow
      className={cn("overflow-hidden", className)}
      backgroundColor={backgroundColor}
      glowColor="34 44 72"
      borderRadius={18}
      glowRadius={26}
      glowIntensity={1.1}
      edgeSensitivity={48}
      coneSpread={18}
      fillOpacity={0.4}
      colors={[
        "rgba(196, 154, 74, 0.55)",
        "rgba(160, 80, 53, 0.45)",
        "rgba(115, 123, 76, 0.50)",
      ]}
    >
      {children}
    </BorderGlow>
  );
}
