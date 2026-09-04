import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/data/content";

const ROTATE_MS = 1800;

interface ProjectPreviewCarouselProps {
  project: Project | null;
}

// Auto-cycles through the active project's demo clips (video: true images),
// each playing to its natural end before advancing. Projects with no clips
// fall back to cycling stills on a flat interval.
export function ProjectPreviewCarousel({
  project,
}: ProjectPreviewCarouselProps) {
  const videos = project?.images.filter((image) => image.video) ?? [];
  const stills = project?.images.filter((image) => !image.video) ?? [];
  const items = videos.length > 0 ? videos : stills;

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [project]);

  // Only the still-image fallback rotates on a timer — video items
  // advance themselves, via onEnded below.
  useEffect(() => {
    if (videos.length > 0 || items.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [project, videos.length, items.length]);

  const current = items[index];

  return (
    // Matches the screenshot files' real aspect ratio so object-contain has
    // nothing to letterbox.
    <div className="pointer-events-none relative aspect-2940/1594 w-full overflow-hidden">
      {/* Keyed per project: the curtain replays on every switch. No
          mode="wait" — outgoing exits while incoming enters simultaneously,
          not sequentially, which read as a "jump" before. */}
      <AnimatePresence>
        {project && current && (
          <motion.div
            key={project.slug}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full"
          >
            {current.video ? (
              <video
                // A fresh element per clip — reusing one <video> and
                // swapping `src` can leave the previous frame on screen
                // for a beat.
                key={current.src}
                src={current.src}
                className="h-full w-full object-contain"
                autoPlay
                muted
                playsInline
                onEnded={() =>
                  setIndex((i) => (i + 1) % items.length)
                }
              />
            ) : (
              <img
                src={current.src}
                alt={project.name}
                className="h-full w-full object-contain"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
