import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Every page starts already fully covered (no cover-in animation) and only
// plays the reveal. Mount with `key={location.pathname}` so a fresh instance
// appears in the same render as the new route's content — avoids a flash of
// the destination page peeking through before the curtain catches up.
const HOLD_MS = 180;
const SMOOTH_EASE = [0.4, 0, 0.2, 1] as const;
const REVEAL_TRANSITION = { duration: 0.7, ease: SMOOTH_EASE };
const INSTANT = { duration: 0 };

export function PageLoadCurtain() {
  const [revealed, setRevealed] = useState(false);
  const timeoutRef = useRef<number>(undefined);

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => setRevealed(true), HOLD_MS);
    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-9999 bg-black"
      initial={{ y: "0%" }}
      animate={{ y: revealed ? "100%" : "0%" }}
      transition={revealed ? REVEAL_TRANSITION : INSTANT}
    />
  );
}
