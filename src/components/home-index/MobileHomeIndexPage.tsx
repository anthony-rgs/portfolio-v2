import { content, type Project } from "@/data/content";
import { IntroText } from "@/components/IntroText";
import { InViewReveal } from "@/components/InViewReveal";
import { DimmedLabel } from "@/components/DimmedLabel";
import {
  CopyEmailLink,
  DownloadCvLink,
} from "@/components/home-index/HomeIntro";

interface MobileHomeIndexPageProps {
  onNavigate: (project: Project) => void;
}

const GRID_STAGGER_S = 0.06;
const TILE_ASPECT = "2940/1594";

// Below 1024px, the desktop layout's wheel-driven scroll machinery doesn't
// translate to a normally-scrolling mobile page — a genuinely different
// layout: no Index list, no music player, projects in a simple grid. Every
// block below the title is wrapped in InViewReveal (scroll-triggered)
// instead of a page-load timer.
export function MobileHomeIndexPage({
  onNavigate,
}: MobileHomeIndexPageProps) {
  return (
    <div className="pb-12">
      <IntroText
        titleLines={content.home.titleLines}
        subtitleLines={content.home.subtitleLines}
      />

      <div className="mt-12 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2">
        {content.projects.map((project, i) => (
          <InViewReveal
            key={project.slug}
            delay={(i % 3) * GRID_STAGGER_S}
            className="w-full"
          >
            <button
              type="button"
              onClick={() => onNavigate(project)}
              className="block w-full cursor-pointer text-left"
            >
              <img
                src={project.src}
                alt={project.name}
                style={{ aspectRatio: TILE_ASPECT }}
                className="w-full rounded-lg object-cover"
              />
              <div className="mt-2 text-[14px] font-medium tracking-tight sm:text-[15px]">
                {project.name}
              </div>
            </button>
          </InViewReveal>
        ))}
      </div>

      <InViewReveal className="mt-16">
        <footer className="flex gap-16 text-[12px] sm:text-[13px]">
          <div>
            <DimmedLabel>Contact</DimmedLabel>
            <div className="mt-1">
              <CopyEmailLink email={content.home.email} />
            </div>
          </div>
          <div>
            <DimmedLabel>CV</DimmedLabel>
            <div className="mt-1">
              <DownloadCvLink />
            </div>
          </div>
        </footer>
      </InViewReveal>
    </div>
  );
}
