import { useEffect, useRef } from "react";
import { useAnimationFrame, useMotionValue, type MotionValue } from "framer-motion";
import { isWheelLocked } from "@/lib/wheelLock";

interface UseInfiniteScrollOptions {
  itemHeight: number;
  itemCount: number;
  sensitivity?: number;
  lerpFactor?: number;
}

interface UseInfiniteScrollResult {
  // Always wrapped into [0, totalHeight) — never grows unbounded.
  offset: MotionValue<number>;
  totalHeight: number;
}

// Drives a virtual vertical scroll: wheel/touch deltas accumulate into a
// target, which a lerp chases every frame. Exposed as a MotionValue rather
// than React state so consumers derive from it via useTransform without a
// re-render every frame. Listens on `window`, not a scoped container — this
// scroll is meant to be captured anywhere on screen.
export function useInfiniteScroll({
  itemHeight,
  itemCount,
  sensitivity = 1,
  lerpFactor = 0.08,
}: UseInfiniteScrollOptions): UseInfiniteScrollResult {
  const totalHeight = itemHeight * itemCount;
  const target = useRef(0);
  const current = useRef(0);
  const offset = useMotionValue(0);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // TrackRadialMenu claims the wheel while open — ignore the event
      // instead of also scrolling underneath it.
      if (isWheelLocked()) return;
      event.preventDefault();
      target.current += event.deltaY * sensitivity;
    };

    let touchY = 0;
    const handleTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0].clientY;
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (isWheelLocked()) return;
      event.preventDefault();
      const nextY = event.touches[0].clientY;
      target.current += (touchY - nextY) * sensitivity;
      touchY = nextY;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [sensitivity]);

  useAnimationFrame(() => {
    // The accumulator itself is never wrapped (only `offset` is) — wrapping
    // it here would make (target - current) jump every cycle and the lerp
    // would snap instead of gliding.
    current.current += (target.current - current.current) * lerpFactor;

    const wrapped = ((current.current % totalHeight) + totalHeight) % totalHeight;
    offset.set(wrapped);
  });

  return { offset, totalHeight };
}

// Wraps `value` to whichever representative sits closest to 0 — lets each
// looping item sit at the copy nearest the viewport with no duplicate nodes.
export function wrapToNearest(value: number, period: number): number {
  return value - period * Math.round(value / period);
}
