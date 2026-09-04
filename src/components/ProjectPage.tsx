import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { content, type Project } from "@/data/content";
import { useCurtain } from "@/components/CurtainProvider";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import { PageShell } from "@/components/PageShell";
import { IntroText, INTRO_SUBTITLE_DELAY_S } from "@/components/IntroText";
import { ProjectMeta } from "@/components/ProjectMeta";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ProjectEndCard } from "@/components/ProjectEndCard";
import { MobileProjectPage } from "@/components/MobileProjectPage";

export function ProjectPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { trigger: triggerCurtain, triggerBack } = useCurtain();
  const isMobileLayout = useIsMobileLayout();
  const projectIndex = content.projects.findIndex((p) => p.slug === slug);
  const project = content.projects[projectIndex];
  // Wraps back to the first project after the last one.
  const nextProject =
    projectIndex === -1
      ? undefined
      : content.projects[(projectIndex + 1) % content.projects.length];

  const goToNextProject = () => {
    if (!nextProject) return;
    triggerCurtain(nextProject.name, () =>
      navigate(`/projects/${nextProject.slug}`),
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape")
        triggerCurtain("Anthony", () => navigate("/"));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, triggerCurtain]);

  if (!project)
    return (
      <Navigate
        to="/"
        replace
      />
    );

  if (isMobileLayout) {
    return (
      // No onBack — MobileProjectPage renders its own BackLink above its content.
      <PageShell>
        <MobileProjectPage
          project={project}
          // project exists here, so nextProject's ternary always took its
          // defined branch.
          nextProject={nextProject as Project}
          onNavigateNext={goToNextProject}
          onBack={triggerBack}
        />
      </PageShell>
    );
  }

  return (
    <PageShell onBack={triggerBack}>
      {/* ProjectGallery's image block is position: fixed, so this wrapper
          only needs to size the info column. */}
      <div className="h-full">
        <ProjectGallery
          images={project.images}
          alt={project.name}
          infoColumn={
            <div className="relative flex h-full flex-col justify-between">
              <IntroText
                headline={project.headline}
                titleLines={project.titleLines}
                subtitleLines={project.subtitleLines}
              />
              <ProjectMeta
                tools={project.tools}
                links={project.links}
                startDelay={INTRO_SUBTITLE_DELAY_S}
              />
            </div>
          }
          endCard={
            nextProject
              ? (visible: boolean) => (
                  <ProjectEndCard
                    project={project}
                    nextProject={nextProject}
                    onNavigateNext={goToNextProject}
                    visible={visible}
                  />
                )
              : undefined
          }
        />
      </div>
    </PageShell>
  );
}
