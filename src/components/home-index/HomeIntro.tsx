import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACCENT_BLUE } from "@/lib/colors";
import { content } from "@/data/content";
import { DimmedLabel } from "@/components/DimmedLabel";
import { IntroText } from "@/components/IntroText";
import { useCopiedState } from "@/hooks/useCopiedState";
import {
  REVEAL_BASE_DELAY_S,
  REVEAL_STAGGER_S,
  RevealItem,
} from "@/components/RevealItem";

const COPIED_HOLD_MS = 4000;
const SWAP_TRANSITION = { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const };

// Text swaps to "Email copié !" on click, unlike Navbar's Contact (which
// dims and shows the confirmation below instead) — only the copy/timing
// logic is shared, via useCopiedState. exit is RevealItem's animate/initial
// pair flipped.
export function CopyEmailLink({ email }: { email: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const { copied, copy } = useCopiedState(email, COPIED_HOLD_MS);

  return (
    <button
      type="button"
      onClick={copy}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative inline-block cursor-pointer overflow-hidden align-top"
    >
      {/* Invisible, pins the container to the email's width so swapping to
          the shorter "Email copié !" never shrinks it. */}
      <span
        aria-hidden
        className="invisible"
      >
        {email}
      </span>
      <AnimatePresence
        mode="wait"
        initial={false}
      >
        {copied ? (
          <motion.span
            key="copied"
            className="absolute inset-0 text-left"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={SWAP_TRANSITION}
          >
            Email copié !
          </motion.span>
        ) : (
          <motion.span
            key="email"
            className="absolute inset-0 text-left"
            style={{
              color: isHovered ? ACCENT_BLUE : undefined,
              transition: "color 0.3s",
            }}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={SWAP_TRANSITION}
          >
            {email}
            {/* Nested inside the same motion.span, not a persistent sibling
                — slides in/out as one unit with the text. */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 2,
                height: 1,
                background: ACCENT_BLUE,
                transformOrigin: isHovered ? "left" : "right",
                transform: `scaleX(${isHovered ? 1 : 0})`,
                transition: "transform 0.4s ease-out",
              }}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// Same design as ProjectMeta's ExternalLink: hover color/underline apply
// only to the text span, the icon stays put via currentColor.
export function DownloadCvLink() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href="/ringressi-anthony-cv.pdf"
      download
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="inline-flex cursor-pointer items-center gap-1"
    >
      <span
        style={{
          position: "relative",
          color: isHovered ? ACCENT_BLUE : undefined,
          transition: "color 0.3s",
        }}
      >
        Télécharger
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 2,
            height: 1,
            background: ACCENT_BLUE,
            transformOrigin: isHovered ? "left" : "right",
            transform: `scaleX(${isHovered ? 1 : 0})`,
            transition: "transform 0.4s ease-out",
          }}
        />
      </span>
      <span
        style={{
          display: "inline-block",
          transform: isHovered ? "translateX(4px)" : "translateX(0)",
          transition: "transform 0.3s ease",
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 1v6M2.3 4.7L5 7.4l2.7-2.7M1.5 8.5h7" />
        </svg>
      </span>
    </a>
  );
}

export function HomeIntro() {
  return (
    <div className="flex h-full flex-col justify-between">
      <IntroText
        titleLines={content.home.titleLines}
        subtitleLines={content.home.subtitleLines}
      />

      <footer className="flex gap-20 text-[12px] sm:text-[13px] lg:text-[14px] xl:text-[16px]">
        <div>
          <RevealItem delay={REVEAL_BASE_DELAY_S}>
            <DimmedLabel>Contact</DimmedLabel>
          </RevealItem>
          <RevealItem delay={REVEAL_BASE_DELAY_S + REVEAL_STAGGER_S}>
            <CopyEmailLink email={content.home.email} />
          </RevealItem>
        </div>
        <div className="text-right">
          <RevealItem delay={REVEAL_BASE_DELAY_S + REVEAL_STAGGER_S * 2}>
            <DimmedLabel>CV</DimmedLabel>
          </RevealItem>
          {/* pr-2 -mr-2: room for the icon's hover nudge without shifting
              ml-auto's right alignment. */}
          <RevealItem
            delay={REVEAL_BASE_DELAY_S + REVEAL_STAGGER_S * 3}
            className="ml-auto pr-2 -mr-2"
          >
            <DownloadCvLink />
          </RevealItem>
        </div>
      </footer>
    </div>
  );
}
