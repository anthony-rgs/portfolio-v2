import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

interface PageShellProps {
  children: ReactNode;
  // Passed through to Navbar — only project pages set this.
  onBack?: () => void;
}

// Navbar takes its own natural height; content gets exactly what's left
// (`flex-1`) — 100dvh minus the navbar, no calc() needed.
export function PageShell({ children, onBack }: PageShellProps) {
  const location = useLocation();

  // Below lg, pages scroll natively — client-side navigation doesn't reset
  // that on its own, so leaving a scrolled-down mobile page lands on the
  // next one already scrolled down. Happens under the still-covering
  // curtain, so it's invisible.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div
      // min-h-dvh, not h-dvh: below 1024px, the page (Navbar included) is
      // free to scroll natively with its content. min-[1024px]:h-dvh pins
      // the exact viewport height on desktop, where the wheel-driven
      // galleries need a fixed frame — pinned to the same literal 1024px as
      // useIsMobileLayout (not the `lg` token, which text sizing now uses
      // at 1200px instead) so this frame switch always matches the actual
      // mobile/desktop component tree switch.
      className="font-aktiv flex min-h-dvh flex-col bg-[#fcfafa] text-[#030D26] min-[1024px]:h-dvh"
    >
      <Navbar onBack={onBack} />
      {/* key={location.pathname}: only this remounts on navigation, resetting
          any local scroll state (e.g. ProjectGallery's accumulator) that a
          same-route param change wouldn't otherwise reset. min-[1024px]:min-h-0:
          only clipped to "whatever's left after Navbar" on desktop — below
          that it keeps auto min-height, free to grow to its content. Pinned
          to the same 1024px as the h-dvh switch above, not the `lg` token. */}
      <main
        key={location.pathname}
        className="relative flex-1 px-4 sm:px-5 min-[1024px]:min-h-0 min-[1024px]:pb-5"
      >
        {children}
      </main>
    </div>
  );
}
