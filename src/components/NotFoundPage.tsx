import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ACCENT_BLUE } from "@/lib/colors";
import { useCurtain } from "@/components/CurtainProvider";
import { PageShell } from "@/components/PageShell";
import { INTRO_SUBTITLE_DELAY_S, INTRO_TITLE_DELAY_S } from "@/components/IntroText";
import { REVEAL_STAGGER_S, RevealItem } from "@/components/RevealItem";

function GoHomeButton() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { trigger: triggerCurtain } = useCurtain();

  const goHome = () =>
    triggerCurtain("Anthony Ringressi", () => navigate("/"));

  return (
    <button
      type="button"
      onClick={goHome}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer"
    >
      <span
        style={{
          position: "relative",
          color: isHovered ? ACCENT_BLUE : undefined,
          transition: "color 0.3s",
        }}
      >
        Retour à l'accueil
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

export function NotFoundPage() {
  return (
    <PageShell>
      {/* Centered only at lg+, where PageShell is a fixed-height frame — below
          that it sits at the top like every other page's mobile layout. */}
      <div className="flex flex-col items-center pt-16 text-center lg:h-full lg:justify-center lg:pt-0">
        <RevealItem delay={INTRO_TITLE_DELAY_S}>
          <h1 className="text-[18vw] font-black leading-[0.9] tracking-tighter sm:text-[12vw] lg:text-[8vw]">
            404
          </h1>
        </RevealItem>
        <RevealItem
          delay={INTRO_SUBTITLE_DELAY_S}
          className="mt-4"
        >
          <p className="text-[14px] text-[#030D26]/60 lg:text-base">
            Cette page n'existe pas.
          </p>
        </RevealItem>
        <RevealItem
          delay={INTRO_SUBTITLE_DELAY_S + REVEAL_STAGGER_S}
          className="mt-8 text-[14px] font-medium lg:text-base"
        >
          <GoHomeButton />
        </RevealItem>
      </div>
    </PageShell>
  );
}
