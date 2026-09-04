import type { ReactNode } from "react";
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

  return (
    <div
      // min-h-dvh, not h-dvh: below lg, the page (Navbar included) is free
      // to scroll natively with its content. lg:h-dvh pins the exact
      // viewport height on desktop, where the wheel-driven galleries need
      // a fixed frame.
      className="font-aktiv flex min-h-dvh flex-col bg-[#fcfafa] text-[#030D26] lg:h-dvh"
    >
      <Navbar onBack={onBack} />
      {/* key={location.pathname}: only this remounts on navigation, resetting
          any local scroll state (e.g. ProjectGallery's accumulator) that a
          same-route param change wouldn't otherwise reset. lg:min-h-0: only
          clipped to "whatever's left after Navbar" on desktop — below lg it
          keeps auto min-height, free to grow to its content. */}
      <main
        key={location.pathname}
        className="relative flex-1 px-4 sm:px-5 lg:min-h-0 lg:pb-5"
      >
        {children}
      </main>
    </div>
  );
}
