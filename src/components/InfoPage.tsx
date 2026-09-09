import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { content } from "@/data/content";
import { cn } from "@/lib/utils";
import { useCurtain } from "@/components/CurtainProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { PageShell } from "@/components/PageShell";
import {
  IntroSubtitle,
  IntroText,
  INTRO_SUBTITLE_DELAY_S,
  INTRO_TITLE_DELAY_S,
} from "@/components/IntroText";
import { DimmedLabel } from "@/components/DimmedLabel";
import { InViewReveal } from "@/components/InViewReveal";
import { ExternalLink } from "@/components/ProjectMeta";
import { BackLink } from "@/components/Navbar";
import { REVEAL_STAGGER_S, RevealItem } from "@/components/RevealItem";
import { RevealItemFixed } from "@/components/RevealItemFixed";
import {
  RISE_DELAY_S,
  RISE_EASE,
} from "@/components/home-index/ScrollingImageColumn";
import {
  CopyEmailLink,
  DownloadCvLink,
} from "@/components/home-index/HomeIntro";

// Real aspect ratio of public/img/me.webp — object-cover against it instead
// of letting the fixed width/height pair distort it.
const PHOTO_ASPECT = "3636/2432";
const TAG_STAGGER_S = 0.03;
// Matches the sitewide sm breakpoint (600px), the usual phone/tablet split
// — StackedInfo is reserved for true phone widths.
const WIDE_LAYOUT_QUERY = "(min-width: 600px)";
// Slower than RISE_DURATION_S — this photo is the only thing sliding in on
// this page, so it can take its time.
const PHOTO_DURATION_S = 1.2;
// Small stagger between CV and GitHub, the only two blocks sharing the same
// InViewReveal scroll-trigger moment side by side.
const LINK_STAGGER_S = 0.12;

// animate=false (StackedInfo, below the fold) skips motion — InViewReveal
// drives that block's entrance on scroll instead. animate=true (WideInfo)
// defers to RevealItemFixed, not RevealItem — RevealItem's duration
// (REVEAL_END_S - delay) shrinks toward nothing once enough staggered
// items (15 skill tags) push the last delay near that ceiling.
function Reveal({
  animate,
  delay,
  className,
  children,
}: {
  animate: boolean;
  delay: number;
  className?: string;
  children: ReactNode;
}) {
  if (!animate)
    return (
      <div className={cn("w-fit overflow-hidden whitespace-nowrap", className)}>
        {children}
      </div>
    );
  return (
    <RevealItemFixed
      delay={delay}
      className={className}
    >
      {children}
    </RevealItemFixed>
  );
}

interface SkillsProps {
  delay: number;
  animate?: boolean;
  className?: string;
}

function Skills({ delay, animate = true, className }: SkillsProps) {
  return (
    <div className={cn("leading-tight", className)}>
      <Reveal
        animate={animate}
        delay={delay}
      >
        <DimmedLabel>Compétences</DimmedLabel>
      </Reveal>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
        {content.info.skills.map((skill, i) => (
          <Reveal
            key={skill}
            animate={animate}
            delay={delay + REVEAL_STAGGER_S + i * TAG_STAGGER_S}
          >
            <span className="flex items-center gap-2">
              <div>
                {skill}
                {i + 1 !== content.info.skills.length && (
                  <span aria-hidden>,</span>
                )}
              </div>
            </span>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

interface InfoLinkBlockProps {
  delay: number;
  animate?: boolean;
}

function ContactBlock({ delay, animate = true }: InfoLinkBlockProps) {
  return (
    <div className="leading-tight">
      <Reveal
        animate={animate}
        delay={delay}
      >
        <DimmedLabel>Contact</DimmedLabel>
      </Reveal>
      <Reveal
        animate={animate}
        delay={delay + REVEAL_STAGGER_S}
      >
        <CopyEmailLink email={content.home.email} />
      </Reveal>
    </div>
  );
}

function CvBlock({ delay, animate = true }: InfoLinkBlockProps) {
  return (
    <div className="leading-tight">
      <Reveal
        animate={animate}
        delay={delay}
      >
        <DimmedLabel>CV</DimmedLabel>
      </Reveal>
      {/* pt-2 -mt-2 pr-2: same buffer DownloadCvLink's icon nudge needs
          elsewhere (HomeIntro, ProjectMeta). */}
      <Reveal
        animate={animate}
        delay={delay + REVEAL_STAGGER_S}
        className="-mt-2 pt-2 pr-2"
      >
        <DownloadCvLink />
      </Reveal>
    </div>
  );
}

function GithubBlock({ delay, animate = true }: InfoLinkBlockProps) {
  return (
    <div className="leading-tight">
      <Reveal
        animate={animate}
        delay={delay}
      >
        <DimmedLabel>GitHub</DimmedLabel>
      </Reveal>
      <Reveal
        animate={animate}
        delay={delay + REVEAL_STAGGER_S}
        className="-mt-2 pt-2 pr-2"
      >
        <ExternalLink
          text="Voir le profil"
          link={content.info.github}
        />
      </Reveal>
    </div>
  );
}

// Desktop/tablet (WideInfo): slides in from the right, same motif as
// ProjectGallery's image block.
function Photo() {
  return (
    <motion.img
      src="/img/me.webp"
      alt="Anthony Ringressi"
      style={{ aspectRatio: PHOTO_ASPECT }}
      className="w-full rounded-lg object-cover"
      initial={{ x: "100%" }}
      animate={{ x: "0%" }}
      transition={{
        duration: PHOTO_DURATION_S,
        ease: RISE_EASE,
        delay: RISE_DELAY_S,
      }}
    />
  );
}

// StackedInfo (true mobile): a plain img, no motion of its own — wrapped in
// InViewReveal by the caller instead, same scroll-triggered reveal as
// MobileHomeIndexPage's thumbnails.
function MobilePhoto() {
  return (
    <img
      src="/img/me.webp"
      alt="Anthony Ringressi"
      style={{ aspectRatio: PHOTO_ASPECT }}
      className="w-full rounded-lg object-cover"
    />
  );
}

// 1300px+: fit-content text column, sized by the Contact/CV/GitHub row (its
// only child not given a percentage width — the rest wrap to fit that
// row's own width), next to a bigger photo.
function WideInfo() {
  return (
    <div className="flex h-full justify-between gap-x-[3vw] lg:gap-x-[6vw]">
      <div className="relative flex w-fit max-w-[46vw] flex-col justify-between">
        <div className="max-w-full">
          <IntroText
            titleLines={content.info.titleLines}
            subtitleLines={content.info.subtitleLines}
          />
        </div>

        {/* Compétences on its own full-width row (its tag list needs the
            room), then Contact/CV/GitHub as a flat row underneath. */}
        <footer className="mt-16 w-full text-[12px] sm:text-[13px] lg:text-[14px] xl:text-[16px]">
          <Skills
            delay={INTRO_SUBTITLE_DELAY_S}
            className="w-full"
          />
          <div className="mt-6 flex flex-wrap gap-x-12 gap-y-6">
            <ContactBlock
              delay={INTRO_SUBTITLE_DELAY_S + REVEAL_STAGGER_S * 2}
            />
            <CvBlock
              delay={INTRO_SUBTITLE_DELAY_S + REVEAL_STAGGER_S * 4}
            />
            <GithubBlock
              delay={INTRO_SUBTITLE_DELAY_S + REVEAL_STAGGER_S * 6}
            />
          </div>
        </footer>
      </div>

      <div className="w-[36vw] overflow-hidden">
        <div className="mt-[17%]">
          <Photo />
        </div>
      </div>
    </div>
  );
}

// Below 600px: title -> photo -> description -> Compétences -> CV/GitHub ->
// Contact. Title/description on RevealItem's page-load timer, everything
// below the fold on InViewReveal's scroll-triggered one instead.
const SECTION_GAP = "mt-10";
// Tighter than SECTION_GAP — the photo sits between title and description,
// not between two distinct sections.
const PHOTO_GAP = "mt-6";

function StackedInfo({ onBack }: { onBack: () => void }) {
  return (
    <div className="pb-12">
      <RevealItem
        delay={INTRO_TITLE_DELAY_S - REVEAL_STAGGER_S}
        className="mb-6 text-[14px]"
      >
        <BackLink
          onClick={onBack}
          animated={false}
        />
      </RevealItem>

      <IntroText
        titleLines={content.info.titleLines}
        subtitleLines={[]}
      />

      <InViewReveal
        className={PHOTO_GAP}
        duration={PHOTO_DURATION_S}
      >
        <MobilePhoto />
      </InViewReveal>

      <IntroSubtitle
        lines={content.info.subtitleLines}
        delay={INTRO_SUBTITLE_DELAY_S}
        className={`${PHOTO_GAP} w-full`}
      />

      {/* Below the fold on a natively-scrolling page — RevealItem's
          page-load timer would finish off-screen before anyone scrolls this
          far. InViewReveal drives each block's entrance on scroll instead;
          animate={false} stops each inner Reveal from also playing on
          mount. CV/GitHub each get their own InViewReveal (className on
          InViewReveal lands on its clip box, not the flex row) — the small
          delay between them is what makes them arrive "chacun leur tour". */}
      <InViewReveal className={SECTION_GAP}>
        <Skills
          delay={0}
          animate={false}
        />
      </InViewReveal>

      <div className={`${SECTION_GAP} flex gap-10`}>
        <InViewReveal>
          <CvBlock
            delay={0}
            animate={false}
          />
        </InViewReveal>
        <InViewReveal delay={LINK_STAGGER_S}>
          <GithubBlock
            delay={0}
            animate={false}
          />
        </InViewReveal>
      </div>

      <InViewReveal className={SECTION_GAP}>
        <ContactBlock
          delay={0}
          animate={false}
        />
      </InViewReveal>
    </div>
  );
}

export function InfoPage() {
  const navigate = useNavigate();
  const { trigger: triggerCurtain, triggerBack } = useCurtain();
  const isWideLayout = useMediaQuery(WIDE_LAYOUT_QUERY);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape")
        triggerCurtain("Anthony", () => navigate("/"));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, triggerCurtain]);

  return (
    <PageShell
      // Only wired up when WideInfo is showing — StackedInfo (below 1300px)
      // renders its own Retour above the title, and Navbar's own hides
      // only below the sitewide 1024px cutoff, so both would otherwise
      // show between those two thresholds.
      onBack={isWideLayout ? triggerBack : undefined}
    >
      {isWideLayout ? <WideInfo /> : <StackedInfo onBack={triggerBack} />}
    </PageShell>
  );
}
