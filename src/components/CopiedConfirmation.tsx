import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SWAP_EASE = [0.4, 0, 0.2, 1] as const;
const SWAP_DURATION_S = 0.5;

interface CopiedConfirmationProps {
  visible: boolean;
  label?: string;
  className?: string;
}

// RevealItem's rise-and-clip, played in reverse on exit — the "X copié !"
// confirmation shared by HomeIntro's email swap and Navbar's Contact.
export function CopiedConfirmation({ visible, label = "Email copié !", className }: CopiedConfirmationProps) {
  return (
    <div className={cn("w-fit overflow-hidden whitespace-nowrap", className)}>
      <AnimatePresence>
        {visible && (
          <motion.span
            className="font-regular pointer-events-none block"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ duration: SWAP_DURATION_S, ease: SWAP_EASE }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
