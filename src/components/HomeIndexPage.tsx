import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { content, type Project } from "@/data/content";
import { useCurtain } from "@/components/CurtainProvider";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import { PageShell } from "@/components/PageShell";
import { HomeIntro } from "@/components/home-index/HomeIntro";
import { ProjectIndexList } from "@/components/home-index/ProjectIndexList";
import { ScrollingImageColumn } from "@/components/home-index/ScrollingImageColumn";
import { MobileHomeIndexPage } from "@/components/home-index/MobileHomeIndexPage";

// Homepage: intro on the left, project index on the right, images grouped
// alongside them. Normal flex flow — the image column cancels out Navbar's
// height and main's bottom padding with a matching negative margin
// (-mt-16 -mb-5), reaching past both without escaping document flow.
export function HomeIndexPage() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const navigate = useNavigate();
  const { trigger: triggerCurtain } = useCurtain();
  const isMobileLayout = useIsMobileLayout();

  const handleNavigate = (project: Project) => {
    triggerCurtain(project.name, () => navigate(`/projects/${project.slug}`));
  };

  if (isMobileLayout) {
    return (
      <PageShell>
        <MobileHomeIndexPage onNavigate={handleNavigate} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex h-full justify-between ">
        <div
          className="relative h-full"
          style={{ width: "32.7vw" }}
        >
          <HomeIntro />
        </div>

        <div className="relative flex h-full items-stretch gap-[8.2vw]">
          <div
            // z-20: the negative margin pulls this into Navbar's region —
            // without a higher z-index, Navbar intercepts clicks in the overlap.
            className="relative z-20 -mt-16 -mb-5 h-[calc(100%+5.25rem)]"
            style={{ width: "31.6vw" }}
          >
            <ScrollingImageColumn
              projects={content.projects}
              activeSlug={activeSlug}
              onHoverChange={setActiveSlug}
              onNavigate={handleNavigate}
            />
          </div>

          <div className="relative h-full">
            <ProjectIndexList
              projects={content.projects}
              activeSlug={activeSlug}
              onHoverChange={setActiveSlug}
              onNavigate={handleNavigate}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
