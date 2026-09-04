import { useEffect, type ReactNode } from "react";
import { useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";
import { REVEAL_END_S } from "@/components/RevealItem";

const REVEAL_EASE = [0.4, 0, 0.2, 1] as const;

interface NavRevealProps {
  delay: number;
  // Replays the reveal on change (e.g. location.pathname), imperatively, on
  // the same mounted element — Navbar previously keyed RevealItems to force
  // a remount on navigation, which is what caused a navbar duplication bug.
  trigger: string;
  className?: string;
  children: ReactNode;
}

// Same rise-and-clip motion as RevealItem, but replayed via useAnimate()
// instead of mount-triggered initial/animate — for content that stays
// mounted (Navbar persists across navigation) but must re-enter on route change.
export function NavReveal({ delay, trigger, className, children }: NavRevealProps) {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(
      scope.current,
      { y: ["102%", "2%"] },
      { duration: REVEAL_END_S - delay, ease: REVEAL_EASE, delay },
    );
    // trigger is the only thing that should ever replay this — delay/animate
    // are stable per call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
    <div className={cn("w-fit overflow-hidden whitespace-nowrap", className)}>
      <div ref={scope} style={{ transform: "translateY(102%)" }}>
        {children}
      </div>
    </div>
  );
}
