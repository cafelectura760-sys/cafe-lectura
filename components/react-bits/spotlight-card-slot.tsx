"use client";

import type { ReactNode } from "react";

import SpotlightCard from "@/components/SpotlightCard";
import { cn } from "@/lib/utils";

type SpotlightCardSlotProps = {
  children: ReactNode;
  className?: string;
};

export function SpotlightCardSlot({
  children,
  className,
}: SpotlightCardSlotProps) {
  return (
    <SpotlightCard
      className={cn("!rounded-[16px]", className)}
      spotlightColor="rgba(196, 154, 74, 0.5)"
    >
      {children}
    </SpotlightCard>
  );
}
