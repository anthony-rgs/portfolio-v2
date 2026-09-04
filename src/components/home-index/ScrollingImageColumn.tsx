import { useEffect, useRef, useState, type PointerEvent } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import type { Project } from "@/data/content";
import { REVEAL_END_S } from "@/components/RevealItem";
import { useInfiniteScroll } from "./useInfiniteScroll";
import { ScrollColumnItem } from "./ScrollColumnItem";

// Starts first (right as PageLoadCurtain begins lifting) and, landing on
// the same shared REVEAL_END_S as everything else, is automatically the
// slowest-moving. Exported so other mount entrances (e.g. InfoPage's photo)
// can reuse the same timing.
export const RISE_DELAY_S = 0.33;
export const RISE_DURATION_S = REVEAL_END_S - RISE_DELAY_S;
export const RISE_EASE = [0.4, 0, 0.2, 1] as const;

// Matches the screenshot files' real aspect ratio (2940x1594px) — kept as a
// ratio rather than fixed px so tiles scale with the viewport.
const TILE_ASPECT = 2940 / 1594;
const TILE_WIDTH_VW = "31.6vw";
const TILE_GAP = 32;
const TOP_OFFSET = 28;
// wrapToNearest's flip point (half the total period) falls inside the
// visible area with only `projects.length` slots. Tripling the virtual slot
// count triples the period without changing the on-screen rhythm, pushing
// the flip safely off-screen.
const VIRTUAL_COPIES = 3;

interface ScrollingImageColumnProps {
  projects: Project[];
  activeSlug: string | null;
  onHoverChange: (slug: string | null) => void;
  onNavigate: (project: Project) => void;
}

// The outer div is the full-height capture/clip area; tiles stay a fixed
// vw-width track centered in it — measuring the outer container directly
// would blow tiles up to its full width.
export function ScrollingImageColumn({
  projects,
  activeSlug,
  onHoverChange,
  onNavigate,
}: ScrollingImageColumnProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [tileHeight, setTileHeight] = useState(0);

  // Last known cursor position, re-checked every frame — onMouseEnter/Leave
  // don't fire when scrolling carries a different project under a
  // stationary cursor.
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const activeSlugRef = useRef(activeSlug);
  activeSlugRef.current = activeSlug;

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    const measure = () => setTileHeight(node.clientWidth / TILE_ASPECT);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const itemHeight = tileHeight + TILE_GAP;
  const virtualCount = projects.length * VIRTUAL_COPIES;
  const { offset, totalHeight } = useInfiniteScroll({
    itemHeight: itemHeight || 1, // guards against a 0-height total before first measurement
    itemCount: virtualCount,
  });

  useAnimationFrame(() => {
    const pointer = pointerRef.current;
    if (!pointer) return;
    const el = document.elementFromPoint(pointer.x, pointer.y);
    const slug =
      el instanceof Element
        ? (el.closest<HTMLElement>("[data-slug]")?.dataset.slug ?? null)
        : null;
    if (slug !== activeSlugRef.current) onHoverChange(slug);
  });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    pointerRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerLeave = () => {
    pointerRef.current = null;
    onHoverChange(null);
  };

  return (
    // Rises from below the fold once the curtain starts lifting — a plain
    // mount animation, replaying naturally every route remount.
    <motion.div
      className="relative h-full w-full overflow-hidden"
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      transition={{
        duration: RISE_DURATION_S,
        ease: RISE_EASE,
        delay: RISE_DELAY_S,
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div
        ref={trackRef}
        className="relative mx-auto h-full"
        style={{ width: TILE_WIDTH_VW }}
      >
        {tileHeight > 0 &&
          Array.from({ length: virtualCount }, (_, slotIndex) => {
            const project = projects[slotIndex % projects.length];
            return (
              <ScrollColumnItem
                key={slotIndex}
                project={project}
                index={slotIndex}
                offset={offset}
                totalHeight={totalHeight}
                itemHeight={itemHeight}
                tileHeight={tileHeight}
                topOffset={TOP_OFFSET}
                isActive={activeSlug === project.slug}
                onNavigate={onNavigate}
              />
            );
          })}
      </div>
    </motion.div>
  );
}
