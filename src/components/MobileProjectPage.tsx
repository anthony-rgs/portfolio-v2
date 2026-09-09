import { useState } from "react";
import type { Project } from "@/data/content";
import { ACCENT_BLUE } from "@/lib/colors";
import { cn } from "@/lib/utils";
import {
  IntroText,
  INTRO_SUBTITLE_DELAY_S,
  INTRO_TITLE_DELAY_S,
} from "@/components/IntroText";
import { AutoplayVideo } from "@/components/AutoplayVideo";
import { InViewReveal } from "@/components/InViewReveal";
import { ProjectMeta } from "@/components/ProjectMeta";
import { DimmedLabel } from "@/components/DimmedLabel";
import { BackLink } from "@/components/Navbar";
import { REVEAL_STAGGER_S, RevealItem } from "@/components/RevealItem";

interface MobileProjectPageProps {
  project: Project;
  nextProject: Project;
  onNavigateNext: () => void;
  // Navbar hides "Retour" on mobile/tablet — rendered here instead, above
  // everything else.
  onBack: () => void;
}

const IMAGE_STAGGER_S = 0.06;
const TILE_ASPECT = "2940/1594";
const IMAGE_GRID_CLASSES = "grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2";
// Always 2 columns, not 1 below sm like IMAGE_GRID_CLASSES — text left,
// image right, at every mobile/tablet width.
const NEXT_PROJECT_GRID_CLASSES = "grid grid-cols-2 gap-x-4";
// Matches InfoPage's own SECTION_GAP, so "distinct block" spacing reads the
// same across both pages.
const SECTION_GAP = "mt-10";
const LABEL_GAP = "mt-1";

function NextProjectLink({
  nextProject,
  onClick,
}: {
  nextProject: Project;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${NEXT_PROJECT_GRID_CLASSES} w-full cursor-pointer text-left`}
    >
      {/* justify-end: the image sets the row's height in the two-column
          layout, this bottom-aligns the text against it. */}
      <div className="flex flex-col items-end justify-end pr-2 text-right">
        <DimmedLabel>Prochain projet</DimmedLabel>
        <div
          className="relative mt-1 w-fit text-[14px] font-medium"
          style={{
            color: isHovered ? ACCENT_BLUE : undefined,
            transition: "color 0.3s",
          }}
        >
          {nextProject.name}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0.5 h-px"
            style={{
              background: ACCENT_BLUE,
              transformOrigin: isHovered ? "left" : "right",
              transform: `scaleX(${isHovered ? 1 : 0})`,
              transition: "transform 0.4s ease-out",
            }}
          />
        </div>
      </div>
      <img
        src={nextProject.src}
        alt={nextProject.name}
        style={{ aspectRatio: TILE_ASPECT }}
        className="w-full rounded-lg object-cover"
      />
    </button>
  );
}

// Below 1024px, ProjectGallery's wheel-driven track doesn't translate to a
// normally-scrolling page: title/tools/links up top on RevealItem's
// page-load timer, everything below the fold wrapped in InViewReveal instead.
export function MobileProjectPage({
  project,
  nextProject,
  onNavigateNext,
  onBack,
}: MobileProjectPageProps) {
  // ProjectMeta starts once every subtitle line has had its turn on the
  // page-load clock, instead of sharing IntroText's fixed
  // INTRO_SUBTITLE_DELAY_S (which would overlap it on a single-column page).
  const metaDelay =
    INTRO_SUBTITLE_DELAY_S +
    REVEAL_STAGGER_S * (project.subtitleLines.length + 1);

  return (
    <div className="pb-12">
      {/* Same "arrives just before the title" timing as IntroText's headline row. */}
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
        headline={project.headline}
        titleLines={project.titleLines}
        subtitleLines={project.subtitleLines}
      />

      <div className="mt-8">
        <ProjectMeta
          tools={project.tools}
          links={project.links}
          startDelay={metaDelay}
        />
      </div>

      <InViewReveal className={SECTION_GAP}>
        <DimmedLabel>Galerie</DimmedLabel>
      </InViewReveal>

      <div className={`${LABEL_GAP} ${IMAGE_GRID_CLASSES}`}>
        {project.images.map((image, i) => (
          <InViewReveal
            key={i}
            delay={(i % 3) * IMAGE_STAGGER_S}
          >
            {image.video ? (
              // Rounded on both this wrapper and the video itself —
              // border-radius directly on <video> is unreliable across
              // browsers (hardware-accelerated decoding can bypass it), the
              // overflow-hidden wrapper is the fallback that always shows a radius.
              <div
                style={{
                  aspectRatio: image.contain && image.aspectRatio ? image.aspectRatio : TILE_ASPECT,
                }}
                className="overflow-hidden rounded-xl"
              >
                <AutoplayVideo
                  src={image.src}
                  className={cn("h-full w-full rounded-xl", image.contain ? "object-contain" : "object-cover")}
                />
              </div>
            ) : (
              <img
                src={image.src}
                alt={image.label ?? project.name}
                style={{
                  aspectRatio: image.contain && image.aspectRatio ? image.aspectRatio : TILE_ASPECT,
                }}
                className={cn("w-full rounded-xl", image.contain ? "object-contain" : "object-cover")}
              />
            )}
            {image.label && (
              <div className="mt-2 text-[14px] font-normal tracking-tight sm:text-[15px]">
                {image.label}
              </div>
            )}
          </InViewReveal>
        ))}
      </div>

      <InViewReveal className={SECTION_GAP}>
        <NextProjectLink
          nextProject={nextProject}
          onClick={onNavigateNext}
        />
      </InViewReveal>
    </div>
  );
}
