import { motion, useTransform, type MotionValue } from "framer-motion";
import type { Project } from "@/data/content";
import { wrapToNearest } from "./useInfiniteScroll";

interface ScrollColumnItemProps {
  project: Project;
  index: number;
  offset: MotionValue<number>;
  totalHeight: number;
  itemHeight: number; // slot height (tile + gap) — spacing/wrap math
  tileHeight: number; // actual visible image height
  topOffset: number; // constant px nudge applied to every tile alike
  isActive: boolean; // hovered (or hover-followed-during-scroll) — see ScrollingImageColumn
  onNavigate: (project: Project) => void;
}

export function ScrollColumnItem({
  project,
  index,
  offset,
  totalHeight,
  itemHeight,
  tileHeight,
  topOffset,
  isActive,
  onNavigate,
}: ScrollColumnItemProps) {
  const baseY = index * itemHeight;
  // Wrapped to whichever copy sits nearest the viewport — makes the loop
  // infinite without duplicated items. topOffset is added after wrapping,
  // so it just nudges every tile by a fixed amount.
  const y = useTransform(
    offset,
    (current) => wrapToNearest(baseY - current, totalHeight) + topOffset,
  );

  return (
    // Outer: itemHeight tall (image + TILE_GAP of empty space below it),
    // purely for scroll positioning — no clip/radius here, since that
    // padded box doesn't share an edge with the image at all.
    <motion.div
      className="absolute inset-x-0"
      style={{ y, height: itemHeight }}
    >
      {/* Inner: sized to exactly tileHeight, matching the image itself —
          its overflow-hidden + rounded-lg clip sits right at the image's
          real edges, so the hover scale below clips symmetrically top and
          bottom instead of bleeding into unrelated padded space.
          willChange promotes this wrapper to a stable compositing layer
          ahead of time — plain overflow-hidden + border-radius can still
          fail to clip a transformed child on the edge it's newly growing
          into (a known Chrome/WebKit bug) otherwise. */}
      <div
        className="overflow-hidden rounded-lg"
        style={{ height: tileHeight, willChange: "transform" }}
      >
        <motion.img
          src={project.src}
          alt={project.name}
          // Read by ScrollingImageColumn's hover-follows-scroll check —
          // onMouseEnter/Leave don't fire when the image moves under a
          // stationary cursor.
          data-slug={project.slug}
          style={{ height: tileHeight }}
          className="w-full cursor-pointer object-contain"
          animate={{ scale: isActive ? 1.05 : 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={() => onNavigate(project)}
        />
      </div>
    </motion.div>
  );
}
