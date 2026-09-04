import { useEffect, useRef, useState } from "react";
import { REVEAL_BASE_DELAY_S } from "@/components/RevealItem";

// Manual getBoundingClientRect check, not IntersectionObserver — whileInView
// never fires inside a nested overflow-y-auto container. capture:true on the
// window listener catches scroll events from the actual scrolling inner div,
// since they don't bubble.
//
// Waits REVEAL_BASE_DELAY_S before the first check (matches PageLoadCurtain's
// own lift time) so content already on screen at mount doesn't play its
// reveal mid-cover, and so "hidden" is guaranteed to paint at least once
// before "visible" can be set — checking immediately risked both landing in
// the same commit with nothing to visibly transition from.
export function useScrollReveal(amount: number = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;

    const check = () => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      if (rect.height <= 0) return;
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(window.innerHeight, rect.bottom);
      const visibleFraction = Math.max(0, visibleBottom - visibleTop) / rect.height;
      if (visibleFraction >= amount) setIsVisible(true);
    };

    const timeout = window.setTimeout(() => {
      check();
      window.addEventListener("scroll", check, { passive: true, capture: true });
      window.addEventListener("resize", check);
    }, REVEAL_BASE_DELAY_S * 1000);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("scroll", check, { capture: true });
      window.removeEventListener("resize", check);
    };
  }, [isVisible, amount]);

  return { ref, isVisible };
}
