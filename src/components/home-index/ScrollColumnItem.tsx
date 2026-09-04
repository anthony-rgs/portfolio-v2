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
    <motion.div
      className="absolute inset-x-0 overflow-hidden"
      style={{ y, height: itemHeight }}
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
        animate={{ scale: isActive ? 1.07 : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={() => onNavigate(project)}
      />
    </motion.div>
  );
}
