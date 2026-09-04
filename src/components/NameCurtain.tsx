import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Standalone black-out effect, no knowledge of routing. Mount via
// CurtainProvider/useCurtain with a label + onComplete: covers the screen
// with the name riding in, holds, clears back to plain black, and stops —
// never reveals anything itself. The caller navigates in onComplete, then
// the destination's own (already-black) PageLoadCurtain takes over the
// reveal with no gap between the two.
type Phase = "entering" | "holding" | "clearing";

const VIEWPORT_DVH = 100;
const PANEL_HEIGHT_DVH = 140; // taller than the viewport — see DOCKED_Y below
// Exact-on-paper docking (bottom edge flush) still left a hairline gap from
// dvh sub-pixel rounding — a small overshoot guarantees real overlap.
const DOCK_OVERSHOOT_DVH = 0.6;
const HOLD_MS = 550;
const SMOOTH_EASE = [0.4, 0, 0.2, 1] as const;
const ENTER_TRANSITION = { duration: 0.85, ease: SMOOTH_EASE };
const CLEAR_TRANSITION = { duration: 0.45, ease: SMOOTH_EASE };
const INSTANT = { duration: 0 };

const HIDDEN_Y = "-100%";
// Bottom edge flush (+ overshoot) with the viewport — since the panel is
// taller than the viewport, that's short of -100% by exactly VIEWPORT_DVH.
const DOCKED_Y = `${-((PANEL_HEIGHT_DVH - VIEWPORT_DVH - DOCK_OVERSHOOT_DVH) / PANEL_HEIGHT_DVH) * 100}%`;
const CLEARED_Y = "0%";

const HORIZONTAL_PADDING_PX = 32;
// Arbitrary baseline to measure the label's natural width against — only
// ever used as a ratio.
const MEASURE_FONT_SIZE_PX = 100;

interface NameCurtainProps {
  label: string;
  onComplete: () => void;
}

export function NameCurtain({ label, onComplete }: NameCurtainProps) {
  const [phase, setPhase] = useState<Phase>("entering");
  const holdTimeout = useRef<number>(undefined);
  const textRef = useRef<HTMLSpanElement>(null);
  // Sized to fill (screen width - padding) exactly, whatever the label's
  // length — measured at MEASURE_FONT_SIZE_PX, then scaled to fit.
  const [fontSize, setFontSize] = useState(MEASURE_FONT_SIZE_PX);

  useEffect(() => () => window.clearTimeout(holdTimeout.current), []);

  useLayoutEffect(() => {
    const node = textRef.current;
    if (!node) return;
    const measure = () => {
      node.style.fontSize = `${MEASURE_FONT_SIZE_PX}px`;
      const naturalWidth = node.scrollWidth;
      const availableWidth = window.innerWidth - HORIZONTAL_PADDING_PX * 2;
      setFontSize((availableWidth / naturalWidth) * MEASURE_FONT_SIZE_PX);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [label]);

  const handleAnimationComplete = () => {
    if (phase === "entering") {
      setPhase("holding");
      holdTimeout.current = window.setTimeout(
        () => setPhase("clearing"),
        HOLD_MS,
      );
    } else if (phase === "clearing") {
      onComplete();
    }
  };

  const y = phase === "clearing" ? CLEARED_Y : DOCKED_Y;
  const transition =
    phase === "entering"
      ? ENTER_TRANSITION
      : phase === "clearing"
        ? CLEAR_TRANSITION
        : INSTANT;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-9999 h-[140dvh] bg-black"
      initial={{ y: HIDDEN_Y }}
      animate={{ y }}
      transition={transition}
      onAnimationComplete={handleAnimationComplete}
    >
      <span
        ref={textRef}
        style={{ fontSize, paddingInline: HORIZONTAL_PADDING_PX }}
        className="font-aktiv absolute inset-x-0 bottom-[5dvh] whitespace-nowrap text-center font-black uppercase leading-none tracking-tighter text-white"
      >
        {label}
      </span>
    </motion.div>
  );
}
