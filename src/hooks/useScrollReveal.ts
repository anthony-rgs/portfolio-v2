import { useEffect, useRef, useState } from "react";
import { REVEAL_BASE_DELAY_S } from "@/components/RevealItem";

// IntersectionObserver, not a manual scroll-event check — the latter sampled
// getBoundingClientRect only on each 'scroll' event, which mobile browsers
// throttle/coalesce during momentum scrolling. A fast fling could carry a
// tall element fully across the viewport between two samples, so it was
// never caught "visible" and stayed permanently hidden (y: 102%). The
// observer's callback fires on every threshold crossing regardless of how
// fast the scroll was, so it can't be skipped this way. All current callers
// scroll the real document (no nested overflow-y-auto ancestor), so the
// default viewport root is correct.
//
// Waits REVEAL_BASE_DELAY_S before observing (matches PageLoadCurtain's own
// lift time) so content already on screen at mount doesn't play its reveal
// mid-cover, and so "hidden" is guaranteed to paint at least once before
// "visible" can be set — observing immediately risked both landing in the
// same commit with nothing to visibly transition from.
export function useScrollReveal(amount: number = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;
    const node = ref.current;
    if (!node) return;

    let observer: IntersectionObserver | null = null;
    const timeout = window.setTimeout(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setIsVisible(true);
        },
        { threshold: amount },
      );
      observer.observe(node);
    }, REVEAL_BASE_DELAY_S * 1000);

    return () => {
      window.clearTimeout(timeout);
      observer?.disconnect();
    };
  }, [isVisible, amount]);

  return { ref, isVisible };
}
