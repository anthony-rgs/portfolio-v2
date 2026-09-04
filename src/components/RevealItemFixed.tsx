import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const DURATION_S = 0.6;
const EASE = [0.4, 0, 0.2, 1] as const;

interface RevealItemFixedProps {
  delay: number;
  className?: string;
  children: ReactNode;
}

// Same rise-and-clip motif as RevealItem, but fixed duration instead of
// RevealItem's "REVEAL_END_S - delay" — that formula clamps toward 0 once
// enough staggered siblings (a data-driven tools/links list) push the tail
// end past REVEAL_END_S, popping in with no visible animation.
export function RevealItemFixed({ delay, className, children }: RevealItemFixedProps) {
  return (
    <div className={cn("w-fit overflow-hidden whitespace-nowrap", className)}>
      <motion.div
        initial={{ y: "102%" }}
        animate={{ y: "2%" }}
        transition={{ duration: DURATION_S, ease: EASE, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}
