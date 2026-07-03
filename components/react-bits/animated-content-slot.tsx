"use client";

import type { ElementType, ReactNode } from "react";

import AnimatedContent from "@/components/AnimatedContent";

type AnimatedContentSlotProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
  threshold?: number;
  direction?: "vertical" | "horizontal";
  as?: ElementType;
};

export function AnimatedContentSlot({
  children,
  className,
  delay = 0,
  distance = 24,
  duration = 0.75,
  threshold = 0.15,
  direction = "vertical",
  as,
}: AnimatedContentSlotProps) {
  const Component = as ?? "div";

  if (Component !== "div") {
    return (
      <Component className={className}>
        <AnimatedContent
          distance={distance}
          duration={duration}
          ease="power2.out"
          threshold={threshold}
          delay={delay * 0.1}
          direction={direction}
          className="min-w-0"
        >
          {children}
        </AnimatedContent>
      </Component>
    );
  }

  return (
    <AnimatedContent
      distance={distance}
      duration={duration}
      ease="power2.out"
      threshold={threshold}
      delay={delay * 0.1}
      direction={direction}
      className={className}
    >
      {children}
    </AnimatedContent>
  );
}
