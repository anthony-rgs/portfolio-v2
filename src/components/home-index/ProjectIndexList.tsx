import { cn } from "@/lib/utils";
import type { Project } from "@/data/content";
import { DimmedLabel } from "@/components/DimmedLabel";
import { REVEAL_BASE_DELAY_S, REVEAL_STAGGER_S, RevealItem } from "@/components/RevealItem";
import { ProjectPreviewCarousel } from "./ProjectPreviewCarousel";

interface ProjectIndexListProps {
  projects: Project[];
  activeSlug: string | null;
  onHoverChange: (slug: string | null) => void;
  onNavigate: (project: Project) => void;
}

// Explicit width (not w-fit) — the preview image is `w-full` with no
// intrinsic size, so a shrink-to-content container has nothing to size
// against.
export function ProjectIndexList({
  projects,
  activeSlug,
  onHoverChange,
  onNavigate,
}: ProjectIndexListProps) {
  const activeProject = projects.find((p) => p.slug === activeSlug) ?? null;

  return (
    <nav
      onMouseLeave={() => onHoverChange(null)}
      className="flex h-full w-[8.2vw] -translate-y-6 flex-col items-end justify-center"
    >
      {/* Positioning context for the preview below, kept separate so its
          mount/unmount never shifts the nav's justify-center. */}
      <div className="relative flex flex-col items-end">
        <RevealItem
          delay={REVEAL_BASE_DELAY_S}
          className="mb-3"
        >
          <DimmedLabel>Index</DimmedLabel>
        </RevealItem>

        <ul className="flex flex-col items-end">
          {projects.map((project, index) => (
            <li key={project.slug}>
              <RevealItem delay={REVEAL_BASE_DELAY_S + (index + 1) * REVEAL_STAGGER_S}>
                <button
                  type="button"
                  onMouseEnter={() => onHoverChange(project.slug)}
                  onClick={() => onNavigate(project)}
                  className={cn(
                    "cursor-pointer py-0.5 text-right text-[12px] font-medium transition-colors duration-200 sm:text-[13px] lg:text-[14px] xl:text-[16px]",
                    activeSlug === project.slug
                      ? "text-[#1c58f0]"
                      : activeSlug === null
                        ? "" // no override — inherits the page's default text color
                        : "text-[#030D26]/30",
                  )}
                >
                  {project.name}
                </button>
              </RevealItem>
            </li>
          ))}
        </ul>

        <div className="absolute top-full left-0 mt-4 w-full">
          <ProjectPreviewCarousel project={activeProject} />
        </div>
      </div>
    </nav>
  );
}
