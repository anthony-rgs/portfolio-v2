import { useState } from "react";
import type { Project } from "@/data/content";
import { ACCENT_BLUE } from "@/lib/colors";
import { DimmedLabel } from "@/components/DimmedLabel";
import { InlineLinkText } from "@/components/InlineLinkText";
import { ProjectMeta } from "@/components/ProjectMeta";
import {
  ScrollRevealItem,
  SCROLL_REVEAL_STAGGER_S,
} from "@/components/ScrollRevealItem";

interface ProjectEndCardProps {
  project: Project;
  nextProject: Project;
  onNavigateNext: () => void;
  // Whether the card has scrolled far enough into view (ProjectGallery) to
  // play its entrance — a page-load delay would be long over by then.
  visible: boolean;
}

// Closing panel appended after the last photo in ProjectGallery's track —
// same width as the info column at rest. Repeats the project's name/links,
// then hands off to whichever project comes next.
export function ProjectEndCard({
  project,
  nextProject,
  onNavigateNext,
  visible,
}: ProjectEndCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Padding grows ScrollRevealItem's clip box past the h2's own
            ascender/overhang, which this size/weight/leading clips at the
            boundary otherwise — matching negative margin keeps text in place. */}
        <ScrollRevealItem visible={visible}>
          <h2 className="pt-0.5 pr-0.5 text-[5.2vw] leading-[0.9] font-black tracking-tighter uppercase">
            {project.titleLines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </h2>
        </ScrollRevealItem>
        <ScrollRevealItem
          visible={visible}
          delay={SCROLL_REVEAL_STAGGER_S}
          className="mt-4 max-w-md"
        >
          <p className="text-[#030D26]/60">
            <InlineLinkText text={project.smallDescription} />
          </p>
        </ScrollRevealItem>
        <ScrollRevealItem
          visible={visible}
          delay={SCROLL_REVEAL_STAGGER_S * 2}
          className="mt-6"
        >
          <ProjectMeta
            tools={[]}
            links={project.links}
            startDelay={0}
          />
        </ScrollRevealItem>
      </div>

      <ScrollRevealItem
        visible={visible}
        delay={SCROLL_REVEAL_STAGGER_S * 3}
      >
        <button
          type="button"
          onClick={onNavigateNext}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex cursor-pointer items-end gap-6 text-left"
        >
          <div>
            <DimmedLabel>Prochain projet</DimmedLabel>
            <div
              className="relative mt-1 w-fit text-[15px] font-medium sm:text-[16px] lg:text-[18px] xl:text-[20px]"
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
            style={{
              width: 400,
              maxWidth: "none",
              height: "auto",
              flexShrink: 0,
            }}
            className="rounded-lg"
          />
        </button>
      </ScrollRevealItem>
    </div>
  );
}
