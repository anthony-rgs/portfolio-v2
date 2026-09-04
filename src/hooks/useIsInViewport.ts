import { useEffect, useRef, useState } from "react";

// IntersectionObserver, not useScrollReveal's scroll-event approach — it
// tracks real intersection regardless of whether the target moved via
// scroll or a CSS transform (ProjectGallery's wheel-driven pan).
export function useIsInViewport<T extends HTMLElement>(threshold = 0) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
