import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DimmedLabelProps {
  className?: string;
  children: ReactNode;
}

// Muted micro-label treatment for small category labels sitewide (Index,
// Contact/CV, headlines). Sized per breakpoint tier rather than fluid vw —
// small UI text "wobbles" when it scales continuously, unlike the
// vw-based page titles.
export function DimmedLabel({ className, children }: DimmedLabelProps) {
  return (
    <span
      className={cn(
        "text-[14px] font-medium text-[#030D26]/40 sm:text-[13px] lg:text-[14px] xl:text-[16px]",
        className,
      )}
    >
      {children}
    </span>
  );
}
