import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SCROLL_REVEAL_DURATION_S = 0.5;
const SCROLL_REVEAL_EASE = [0.4, 0, 0.2, 1] as const;
export const SCROLL_REVEAL_STAGGER_S = 0.08;

interface ScrollRevealItemProps {
  visible: boolean;
  delay?: number;
  className?: string;
  children: ReactNode;
}

// Same rise-and-clip motif as RevealItem, but driven by a boolean instead of
// a page-load delay — for content mounted immediately but seen only once
// scrolled into view (ProjectGallery's end card). Reversible: `visible`
// flipping back plays the motion out instead of an instant unmount.
export function ScrollRevealItem({
  visible,
  delay = 0,
  className,
  children,
}: ScrollRevealItemProps) {
  return (
    <div className={cn("w-fit overflow-hidden", className)}>
      <motion.div
        animate={{ y: visible ? "0%" : "100%" }}
        transition={{
          duration: SCROLL_REVEAL_DURATION_S,
          ease: SCROLL_REVEAL_EASE,
          delay,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
