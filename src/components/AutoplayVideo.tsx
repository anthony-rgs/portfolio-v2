import { useEffect, type CSSProperties } from "react";
import { useIsInViewport } from "@/hooks/useIsInViewport";

interface AutoplayVideoProps {
  src: string;
  className?: string;
  style?: CSSProperties;
  // When provided, play/pause is driven by this instead of on-screen
  // visibility — ProjectGallery's desktop view already knows which single
  // tile is active, guaranteeing only one video plays at once. Omit to fall
  // back to IntersectionObserver visibility (mobile grids, no active index).
  active?: boolean;
}

// No `autoPlay` — play/pause is always driven imperatively, by `active` or
// the fallback visibility check below.
export function AutoplayVideo({ src, className, style, active }: AutoplayVideoProps) {
  // 0.6: requires most of a tile on screen before playing, so adjacent
  // tiles don't both cross the threshold at once during a scroll transition.
  const { ref, isVisible } = useIsInViewport<HTMLVideoElement>(0.6);
  const shouldPlay = active ?? isVisible;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (shouldPlay) {
      // Swallow rejection — the browser can block play() (e.g. an
      // immediate pause() after), nothing to surface to the user.
      node.play().catch(() => {});
    } else {
      node.pause();
    }
  }, [shouldPlay, ref]);

  return (
    <video
      ref={ref}
      src={src}
      className={className}
      style={style}
      muted
      loop
      playsInline
    />
  );
}
