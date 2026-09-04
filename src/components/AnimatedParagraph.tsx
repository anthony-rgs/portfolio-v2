import { motion } from "framer-motion";
import { InlineLink, parseLinkRuns } from "@/components/InlineLinkText";

// Fixed duration, not RevealItem's "REVEAL_END_S - delay" convergence —
// that breaks down (negative duration) once enough paragraphs stack up.
const PARAGRAPH_DURATION_S = 0.7;
const REVEAL_EASE = [0.4, 0, 0.2, 1] as const;

interface AnimatedParagraphProps {
  text: string;
  delay: number;
}

// Resolves "[label](url)" links (parseLinkRuns) and reveals the whole
// paragraph as one unit — not one motion component per word. Text wraps
// fine on its own; splitting by word only existed to stagger each one
// individually, which read as a diagonal sweep rather than a clean rise, so
// it was dropped (and a bio-length paragraph no longer mounts 100+ nodes).
export function AnimatedParagraph({ text, delay }: AnimatedParagraphProps) {
  const runs = parseLinkRuns(text);

  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: "102%" }}
        animate={{ y: "2%" }}
        transition={{
          duration: PARAGRAPH_DURATION_S,
          ease: REVEAL_EASE,
          delay,
        }}
      >
        {runs.map((run, i) =>
          run.href ? (
            <InlineLink
              key={i}
              href={run.href}
            >
              {run.text}
            </InlineLink>
          ) : (
            run.text
          ),
        )}
      </motion.span>
    </span>
  );
}
