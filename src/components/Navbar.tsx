import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ACCENT_BLUE, TEXT_COLOR } from "@/lib/colors";
import { content } from "@/data/content";
import { useCopiedState } from "@/hooks/useCopiedState";
import { Link } from "@/components/Link";
import { CopiedConfirmation } from "@/components/CopiedConfirmation";
import { useCurtain } from "@/components/CurtainProvider";
import { REVEAL_BASE_DELAY_S, REVEAL_STAGGER_S } from "@/components/RevealItem";
import { NavReveal } from "@/components/NavReveal";

const CONTACT_COPIED_HOLD_MS = 4000;
const DIMMED_OPACITY = 0.3;

interface NavbarProps {
  // Passed by pages that aren't Home (ProjectPage, InfoPage) — shows a
  // "← Retour" link right of the wordmark when present.
  onBack?: () => void;
}

// Icon stays static — only "Retour" gets the hover color/underline, same as
// Info/Contact. Exported: mobile/tablet pages with a back button
// (ProjectPage, StackedInfo) render this themselves above their content
// instead of through Navbar.
interface BackLinkProps {
  onClick: () => void;
  // Off on mobile/tablet — no real hover there, just a tap.
  animated?: boolean;
}

export function BackLink({ onClick, animated = true }: BackLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const iconHovered = animated && isHovered;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="inline-flex cursor-pointer items-center gap-1.5 mt-0.5 font-medium"
    >
      {/* Wrapper handles the hover nudge in plain screen space — nudges
          left, same direction the arrow itself points (going back). */}
      <span
        style={{
          display: "inline-block",
          transform: iconHovered ? "translateX(-4px)" : "translateX(0)",
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
          className="mb-0.5"
        >
          <path d="M9 5H1M1 5L4.5 1.5M1 5L4.5 8.5" />
        </svg>
      </span>
      <span
        style={{
          position: "relative",
          color: isHovered ? ACCENT_BLUE : undefined,
          transition: "color 0.3s",
        }}
      >
        Retour
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
    </button>
  );
}

// On click: copies the contact email, dims "Contact" for
// CONTACT_COPIED_HOLD_MS, and shows "Email copié !" below it as a separate
// label. NavReveal wraps only the "Contact" text (tight clip box) —
// the confirmation sits outside it so top-full isn't clipped.
function ContactLink({ delay, trigger }: { delay: number; trigger: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const { copied, copy } = useCopiedState(
    content.home.email,
    CONTACT_COPIED_HOLD_MS,
  );

  return (
    <button
      type="button"
      onClick={copy}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative cursor-pointer"
    >
      <NavReveal
        delay={delay}
        trigger={trigger}
      >
        <span
          style={{
            opacity: copied ? DIMMED_OPACITY : 1,
            color: isHovered && !copied ? ACCENT_BLUE : undefined,
            transition: "color 0.3s, opacity 0.3s",
          }}
        >
          Contact
        </span>
      </NavReveal>
      {/* Sibling of NavReveal, not nested inside it — NavReveal's own box
          is clipped tight to just the text, so anything positioned outside
          that box (this bar sits a few px below it) gets cut off if it's a
          descendant instead. */}
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
          transform: `scaleX(${isHovered && !copied ? 1 : 0})`,
          transition: "transform 0.4s ease-out",
        }}
      />
      <CopiedConfirmation
        visible={copied}
        className="absolute right-0 top-full mt-1"
      />
    </button>
  );
}

export function Navbar({ onBack }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { trigger: triggerCurtain } = useCurtain();
  // "Retour" shows purely based on whether the caller passes onBack — pages
  // whose own mobile/tablet view renders BackLink itself (ProjectPage,
  // StackedInfo) pass onBack={undefined} there on purpose, since each
  // page's own breakpoint can differ.
  const showBackLink = Boolean(onBack);
  // When there's no back link, Info/Contact keep their original stagger
  // spots instead of leaving a gap.
  const backStep = showBackLink ? 1 : 0;

  const goToInfo = () =>
    triggerCurtain("Informations", () => navigate("/about"));
  const goHome = () => triggerCurtain("Anthony Ringressi", () => navigate("/"));

  return (
    <header
      style={{ color: TEXT_COLOR }}
      className="relative z-10 flex items-center justify-between px-4 py-5 font-medium sm:px-5"
    >
      <div className="flex items-center gap-16">
        {/* trigger={location.pathname}: Navbar never remounts on in-app
            navigation, so the entrance replays imperatively via NavReveal
            instead of a mount-triggered effect. */}
        <NavReveal
          trigger={location.pathname}
          delay={REVEAL_BASE_DELAY_S}
          className="text-[14px] lg:text-[12px] xl:text-[13px] font-regular"
        >
          <button
            type="button"
            onClick={goHome}
            className="cursor-pointer text-[#1c58f0]"
          >
            Anthony Ringressi
          </button>
        </NavReveal>

        {showBackLink && onBack && (
          // pl-2 -ml-2: grows the clip box left for the icon's hover nudge
          // without shifting the button.
          <NavReveal
            trigger={location.pathname}
            delay={REVEAL_BASE_DELAY_S + REVEAL_STAGGER_S}
            className="-ml-2 pl-2 text-[14px] lg:text-[12px] xl:text-[13px]"
          >
            <BackLink onClick={onBack} />
          </NavReveal>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[14px] lg:text-[12px] xl:text-[13px]">
        <NavReveal
          trigger={location.pathname}
          delay={REVEAL_BASE_DELAY_S + REVEAL_STAGGER_S * (1 + backStep)}
        >
          <div className="flex gap-px">
            <Link
              onClick={goToInfo}
              active={location.pathname === "/about"}
              className="cursor-pointer"
            >
              Info
            </Link>
            <p>,</p>
          </div>
        </NavReveal>
        <ContactLink
          trigger={location.pathname}
          delay={REVEAL_BASE_DELAY_S + REVEAL_STAGGER_S * (2 + backStep)}
        />
      </div>
    </header>
  );
}
