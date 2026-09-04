import { useState, type ComponentPropsWithoutRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LinkProps extends ComponentPropsWithoutRef<"button"> {
  // Forces the hover look (blue + underlined) — used by Navbar to mark the
  // link matching the current route.
  active?: boolean;
}

// Underline wipes in from the left on hover, out toward the right on leave —
// same sweep direction both ways, not a retraction.
export function Link({ className, children, active, ...props }: LinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isHighlighted = isHovered || active;

  return (
    <button
      type="button"
      className={cn("relative transition-colors duration-300", isHighlighted && "text-[#1c58f0]", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-0.5 h-px bg-[#1c58f0]"
        style={{ transformOrigin: isHighlighted ? "left" : "right" }}
        animate={{ scaleX: isHighlighted ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </button>
  );
}
