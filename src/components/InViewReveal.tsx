import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { REVEAL_BASE_DELAY_S, REVEAL_END_S } from "@/components/RevealItem";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const REVEAL_EASE = [0.4, 0, 0.2, 1] as const;

interface InViewRevealProps {
  delay?: number;
  // Overrides the default REVEAL_END_S - REVEAL_BASE_DELAY_S duration —
  // for the rare spot that wants a slower/faster rise than the sitewide
  // default without affecting every other InViewReveal on the page.
  duration?: number;
  className?: string;
  children: ReactNode;
}

// Same rise-and-clip motif as RevealItem, same default duration, but
// triggered by scroll (useScrollReveal, 30% visible) instead of a page-load
// timer — REVEAL_BASE_DELAY_S itself lives inside useScrollReveal, `delay`
// here is just the extra stagger between sibling items.
//
// initial is explicit — without it, content briefly flashed in its
// untransformed position before the hidden transform applied, an
// "appear, disappear, reappear" glitch. initial forces the hidden position
// to apply synchronously before the first paint.
export function InViewReveal({
  delay = 0,
  duration = REVEAL_END_S - REVEAL_BASE_DELAY_S,
  className,
  children,
}: InViewRevealProps) {
  const { ref, isVisible } = useScrollReveal(0.3);

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden", className)}
    >
      <motion.div
        initial={{ y: "102%" }}
        // 0%, not RevealItem's resting 2% — 2% of a single text line is
        // sub-pixel and harmless, but this also wraps taller content (image
        // + caption), where it persistently clips the bottom-most element.
        animate={{ y: isVisible ? "0%" : "102%" }}
        transition={{
          duration,
          ease: REVEAL_EASE,
          delay,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
