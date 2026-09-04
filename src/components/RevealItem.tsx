import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Every entrance reveal converges on this moment, regardless of start time —
// duration is (REVEAL_END_S - delay), not fixed. Lets the slider start
// first and slowest, the title next, "le reste" last, all finishing together.
export const REVEAL_END_S = 1.55;
// Start of the last wave ("le reste": navbar, subtitle, footer, index list).
export const REVEAL_BASE_DELAY_S = 0.7;
export const REVEAL_STAGGER_S = 0.12;
const REVEAL_EASE = [0.4, 0, 0.2, 1] as const;

interface RevealItemProps {
  delay: number;
  className?: string;
  children: ReactNode;
}

// Overflow-hidden frame clipping content that rises from y:100% to y:0%,
// sized to its content automatically.
export function RevealItem({ delay, className, children }: RevealItemProps) {
  return (
    <div className={cn("w-fit overflow-hidden whitespace-nowrap", className)}>
      <motion.div
        initial={{ y: "102%" }}
        animate={{ y: "2%" }}
        transition={{
          duration: REVEAL_END_S - delay,
          ease: REVEAL_EASE,
          delay,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
