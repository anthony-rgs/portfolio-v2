import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { isWheelLocked } from "@/lib/wheelLock";
import { TEXT_COLOR } from "@/lib/colors";
import { cn } from "@/lib/utils";
import type { ProjectImage } from "@/data/content";
import { AutoplayVideo } from "@/components/AutoplayVideo";
import {
  RISE_DELAY_S,
  RISE_DURATION_S,
  RISE_EASE,
} from "@/components/home-index/ScrollingImageColumn";

// Sized so the image block's left edge sits at exactly 60vw (same 4:1
// info:gap ratio as HomeIntro/ProjectPage's 32.7/8.2, scaled to sum to 60).
const INFO_WIDTH_VW = 42;
const GAP_VW = 12;
// The image block is fixed-positioned so this sits exactly this far from
// the viewport top/bottom regardless of Navbar's rendered height.
const VERTICAL_MARGIN_PX = 75;
// PageShell main's left padding (px-5) — the image block's left edge is
// this plus whatever's left of the info column and its gap.
const PAGE_LEFT_PADDING_PX = 20;

// Accumulated scroll to fully collapse the info column — tuned to feel
// like a deliberate gesture, not an accidental flick.
const PHASE1_RANGE = 500;
const TILE_ASPECT = 2940 / 1594;
const TILE_GAP = 32;
// Extra room before the end card on top of TILE_GAP — a whole separate
// panel reads better with more air in front of it than between two photos.
const END_CARD_EXTRA_GAP_PX = 96;
// Trailing padding after the track's last item, so it doesn't stop flush
// against the clip boundary's right edge.
const TRACK_END_PADDING_PX = 150;
const SENSITIVITY = 1;
const LERP_FACTOR = 0.08;
// A tile's label shows once it overlaps this leading fraction of the
// viewport width (not the gallery container's own width).
const LABEL_ZONE_FRACTION = 0.4;
// Safety margin so the info column finishes fading strictly before the
// image block's left edge reaches the 40% line.
const INFO_FADE_MARGIN_PX = 60;
// Same left-edge-crossing mechanic as LABEL_ZONE_FRACTION, at 70% instead
// of 40%. Reversible: scrolling back past the line hides the end card again.
const END_CARD_REVEAL_ZONE_FRACTION = 0.7;
const LABEL_TRANSITION_S = 0.35;
const LABEL_EASE = [0.4, 0, 0.2, 1] as const;

// AnimatePresence animates a removed child using the props from its own
// last render — before the direction flip that's removing it — so a plain
// inline ternary on `exit` would use a stale direction. Passing `custom`
// through AnimatePresence itself re-evaluates these variants with the
// current direction even for the exiting element.
const slideVariants = {
  enter: (dir: 1 | -1) => ({ y: dir === 1 ? "100%" : "-100%" }),
  center: { y: "0%" },
  exit: (dir: 1 | -1) => ({ y: dir === 1 ? "-100%" : "100%" }),
};

interface ProjectGalleryProps {
  // IntroText + ProjectMeta, rendered as-is — this component only owns the
  // collapsing box's width/opacity.
  infoColumn: ReactNode;
  images: ProjectImage[];
  alt: string;
  // Render prop, not a plain node — the entrance needs to know when the
  // card has actually scrolled into view, which only this component can compute.
  endCard?: (visible: boolean) => ReactNode;
}

// One clamped (not looped) scroll accumulator drives two things in
// sequence: first the info column collapses away and its gap closes, then
// further scrolling pans the full-width image row through every image once.
export function ProjectGallery({
  infoColumn,
  images,
  alt,
  endCard,
}: ProjectGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endCardRef = useRef<HTMLDivElement>(null);
  const [tileHeight, setTileHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  // The end card sizes itself to its content (w-fit), so unlike tileWidth
  // this has to be measured directly.
  const [endCardWidth, setEndCardWidth] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const measure = () => {
      setTileHeight(node.clientHeight);
      setContainerWidth(node.clientWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // useLayoutEffect so this measures before first paint; re-measured every
  // render (no deps array) so a late layout/font settle still gets picked up.
  useLayoutEffect(() => {
    const node = endCardRef.current;
    if (!node) {
      setEndCardWidth(0);
      return;
    }
    const measure = () => setEndCardWidth(node.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  });

  const tileWidth = tileHeight * TILE_ASPECT;
  // contain images get their own width (image's real aspect ratio) instead
  // of the uniform landscape tileWidth, so their container isn't wider than
  // the content actually painted inside it.
  const tileWidths = images.map((image) =>
    image.contain && image.aspectRatio
      ? tileHeight * image.aspectRatio
      : tileWidth,
  );
  // Cumulative left edge of each tile — replaces the uniform
  // i * (tileWidth + TILE_GAP) math once tile widths can vary.
  const tileLefts = tileWidths.reduce<number[]>((acc, _, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + tileWidths[i - 1] + TILE_GAP);
    return acc;
  }, []);
  const imagesWidth =
    tileWidths.length > 0
      ? tileWidths.reduce((sum, w) => sum + w, 0) +
        TILE_GAP * (tileWidths.length - 1)
      : 0;
  // Where the end card sits along the track, before panning — needed by
  // the visibility check below.
  const endCardLocalLeft = imagesWidth + TILE_GAP + END_CARD_EXTRA_GAP_PX;
  const trackWidth =
    imagesWidth +
    (endCard ? TILE_GAP + END_CARD_EXTRA_GAP_PX + endCardWidth : 0) +
    TRACK_END_PADDING_PX;
  // 0 if the images already fit inside the fully-expanded container.
  const imageScrollMax = Math.max(0, trackWidth - containerWidth);
  const totalScrollRange = PHASE1_RANGE + imageScrollMax;
  // Read inside the wheel handler instead of closing over the prop, so the
  // listener stays registered once instead of churning on every resize tick.
  const totalScrollRangeRef = useRef(totalScrollRange);
  totalScrollRangeRef.current = totalScrollRange;

  const target = useRef(0);
  const current = useRef(0);
  const scrollProgress = useMotionValue(0);

  useEffect(() => {
    const clampTarget = (next: number) => {
      target.current = Math.max(0, Math.min(totalScrollRangeRef.current, next));
    };
    const handleWheel = (event: WheelEvent) => {
      if (isWheelLocked()) return;
      event.preventDefault();
      clampTarget(target.current + event.deltaY * SENSITIVITY);
    };
    let touchY = 0;
    const handleTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0].clientY;
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (isWheelLocked()) return;
      event.preventDefault();
      const nextY = event.touches[0].clientY;
      clampTarget(target.current + (touchY - nextY) * SENSITIVITY);
      touchY = nextY;
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useAnimationFrame(() => {
    current.current += (target.current - current.current) * LERP_FACTOR;
    scrollProgress.set(current.current);
  });

  const infoWidth = useTransform(
    scrollProgress,
    (v) => `${Math.max(0, INFO_WIDTH_VW * (1 - v / PHASE1_RANGE))}vw`,
  );
  // Tied to the same left-edge math as imageLeft, not a fixed fraction of
  // PHASE1_RANGE — a flat fraction landed after the image block's left edge
  // already reached the 40% line on wide screens (info column still
  // visible while the first image was "entering"). Interpolating against
  // actual on-screen position guarantees full fade-out lands first.
  const infoOpacity = useTransform(scrollProgress, (v) => {
    const shrink = Math.max(0, 1 - v / PHASE1_RANGE);
    const restLeftPx =
      PAGE_LEFT_PADDING_PX +
      ((INFO_WIDTH_VW + GAP_VW) / 100) * window.innerWidth;
    const containerLeftPx = restLeftPx * shrink;
    const fadeTarget =
      window.innerWidth * LABEL_ZONE_FRACTION + INFO_FADE_MARGIN_PX;
    if (containerLeftPx <= fadeTarget) return 0;
    return Math.min(
      1,
      (containerLeftPx - fadeTarget) / (restLeftPx - fadeTarget),
    );
  });
  // Image block's left edge: page padding + remaining info column + gap,
  // all shrinking together as scrollProgress advances through phase 1.
  const imageLeft = useTransform(scrollProgress, (v) => {
    const shrink = Math.max(0, 1 - v / PHASE1_RANGE);
    const paddingPx = PAGE_LEFT_PADDING_PX * shrink;
    const infoVw = INFO_WIDTH_VW * shrink;
    const gapVw = GAP_VW * shrink;
    return `calc(${paddingPx}px + ${infoVw}vw + ${gapVw}vw)`;
  });
  const imageX = useTransform(
    scrollProgress,
    (v) => -Math.max(0, Math.min(imageScrollMax, v - PHASE1_RANGE)),
  );

  // Which image is "the" one — images move right to left, so an image's
  // left edge crossing the 40% line is when it takes over the index
  // counter and label. Whichever has most recently crossed is the newest arrival.
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  // Whether any image has crossed yet — gates the counter's mount/unmount
  // so it appears/disappears with the first image's text, instead of
  // showing "01" from the start.
  const [zoneEntered, setZoneEntered] = useState(false);
  // Forward (index going up) plays the swap upward; backward plays it the
  // other way. Same direction drives both the label and the counter.
  const [direction, setDirection] = useState<1 | -1>(1);
  // null, not 0 — computeActive's `index` defaults to 0 even before entering
  // the zone, and scrollProgress fires "change" on every lerp tick, not just
  // real crossings. Starting prevIndexRef at 0 let a pre-crossing idle tick
  // silently poison it before the real first crossing, skipping the
  // direction update. null can't be confused with a real index.
  const prevIndexRef = useRef<number | null>(null);
  useEffect(() => {
    const computeActive = (v: number) => {
      const shrink = Math.max(0, 1 - v / PHASE1_RANGE);
      const containerLeftPx =
        PAGE_LEFT_PADDING_PX * shrink +
        ((INFO_WIDTH_VW + GAP_VW) * shrink * window.innerWidth) / 100;
      const panX = -Math.max(0, Math.min(imageScrollMax, v - PHASE1_RANGE));
      const zoneEnd = window.innerWidth * LABEL_ZONE_FRACTION;

      // Ascending order — the last crossed (highest index) overwrites the
      // rest. Label only updates when the active image actually has one.
      let index = 0;
      let label: string | null = null;
      let entered = false;
      images.forEach((image, i) => {
        const left = containerLeftPx + tileLefts[i] + panX;
        if (left > zoneEnd) return;
        entered = true;
        index = i;
        if (image.label) label = image.label;
      });
      return { index, label, entered };
    };

    return scrollProgress.on("change", (v) => {
      const { index, label, entered } = computeActive(v);
      if (entered) {
        if (prevIndexRef.current === null) {
          // Fresh zone entry (always index 0) — a mount of the counter/
          // label block, not a swap between two mounted numbers, so it
          // always reads as forward regardless of approach direction.
          setDirection(1);
        } else if (index !== prevIndexRef.current) {
          setDirection(index > prevIndexRef.current ? 1 : -1);
        }
        prevIndexRef.current = index;
      } else {
        // Left the zone — the counter/label unmounts, so the next entry
        // should get the same forced-forward treatment as any first entry.
        prevIndexRef.current = null;
      }
      setActiveIndex((prev) => (prev === index ? prev : index));
      setActiveLabel((prev) => (prev === label ? prev : label));
      setZoneEntered((prev) => (prev === entered ? prev : entered));
    });
  }, [images, tileHeight, imageScrollMax, scrollProgress]);

  // Drives the end card's entrance via the endCard render prop, once its
  // left edge crosses END_CARD_REVEAL_ZONE_FRACTION.
  const [endCardVisible, setEndCardVisible] = useState(false);
  useEffect(() => {
    if (!endCard) return;
    return scrollProgress.on("change", (v) => {
      const shrink = Math.max(0, 1 - v / PHASE1_RANGE);
      const containerLeftPx =
        PAGE_LEFT_PADDING_PX * shrink +
        ((INFO_WIDTH_VW + GAP_VW) * shrink * window.innerWidth) / 100;
      const panX = -Math.max(0, Math.min(imageScrollMax, v - PHASE1_RANGE));
      const zoneEnd = window.innerWidth * END_CARD_REVEAL_ZONE_FRACTION;
      const left = containerLeftPx + endCardLocalLeft + panX;
      const next = left <= zoneEnd;
      setEndCardVisible((prev) => (prev === next ? prev : next));
    });
  }, [endCard, endCardLocalLeft, imageScrollMax, scrollProgress]);

  return (
    <>
      {/* No overflow-hidden — with an explicit animated width this box is
          border-box sized, so it was clipping the intro text's own glyph
          overhang. Left unclipped: infoOpacity fades it out well before
          it's narrow enough for the content to visibly spill past its edge. */}
      <motion.div
        className="relative h-full shrink-0"
        style={{ width: infoWidth, opacity: infoOpacity }}
      >
        {/* h-full: what infoColumn's flex-col/justify-between (IntroText
            top, ProjectMeta bottom) resolves its height against — without
            it, justify-between has no height to work with. */}
        <div
          className="h-full"
          style={{ width: `${INFO_WIDTH_VW}vw` }}
        >
          {infoColumn}
        </div>
      </motion.div>

      {/* top/bottom only (not height) pins this VERTICAL_MARGIN_PX from the
          viewport edges regardless of Navbar's height. left tracks the
          collapsing info column; right: 0 bleeds to the true screen edge. */}
      <motion.div
        ref={containerRef}
        className="fixed overflow-hidden"
        style={{
          top: VERTICAL_MARGIN_PX,
          bottom: VERTICAL_MARGIN_PX,
          right: 0,
          left: imageLeft,
        }}
        initial={{ x: "100%" }}
        animate={{ x: "0%" }}
        transition={{
          duration: RISE_DURATION_S,
          ease: RISE_EASE,
          delay: RISE_DELAY_S,
        }}
      >
        <motion.div
          className="absolute inset-y-0 flex items-stretch"
          style={{
            gap: TILE_GAP,
            x: imageX,
            paddingRight: TRACK_END_PADDING_PX,
          }}
        >
          {images.map((image, i) =>
            image.video ? (
              // Rounded on both this wrapper and the video itself —
              // border-radius directly on <video> is unreliable across
              // browsers (hardware-accelerated decoding can bypass it), the
              // overflow-hidden wrapper is the fallback that always shows a radius.
              <div
                key={i}
                style={{ width: tileWidths[i], flexShrink: 0 }}
                className="h-full overflow-hidden rounded-xl"
              >
                <AutoplayVideo
                  src={image.src}
                  className={cn("h-full w-full rounded-xl", image.contain ? "object-contain" : "object-cover")}
                  // The same state driving the counter/label — not a
                  // separate visibility guess.
                  active={zoneEntered && i === activeIndex}
                />
              </div>
            ) : (
              <img
                key={i}
                src={image.src}
                alt={alt}
                style={{ width: tileWidths[i], flexShrink: 0 }}
                className={cn("h-full rounded-xl", image.contain ? "object-contain" : "object-cover")}
              />
            ),
          )}
          {endCard && (
            <div
              ref={endCardRef}
              style={{
                flexShrink: 0,
                marginLeft: END_CARD_EXTRA_GAP_PX,
                width: "fit-content",
              }}
              className="h-full"
            >
              {endCard(endCardVisible)}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Page-level caption, centered on the screen — not tied to any one
          photo's position. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center">
        <div className="w-fit overflow-hidden">
          <AnimatePresence
            mode="wait"
            custom={direction}
          >
            {activeLabel && (
              <motion.span
                key={activeLabel}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: LABEL_TRANSITION_S, ease: LABEL_EASE }}
                style={{ color: TEXT_COLOR }}
                className="block text-[12px] font-medium sm:text-[13px] lg:text-[14px] xl:text-[16px]"
              >
                {activeLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Outer AnimatePresence gates the block's mount/unmount; inner one
          only replays on the current number — "— 05" never animates. */}
      <div
        className="pointer-events-none fixed bottom-4 left-5 z-20 flex items-baseline text-[12px] font-medium tabular-nums sm:text-[13px] lg:text-[14px] xl:text-[16px]"
        style={{ color: TEXT_COLOR }}
      >
        <div className="w-fit overflow-hidden">
          <AnimatePresence
            mode="wait"
            custom={direction}
          >
            {zoneEntered && (
              // Plain fade, not slideVariants — the inner number already
              // plays that y-slide on its own first mount, so reusing
              // slideVariants here stacked a second, doubled motion.
              <motion.span
                key="counter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: LABEL_TRANSITION_S, ease: LABEL_EASE }}
                className="flex items-baseline"
              >
                <span className="inline-block w-fit overflow-hidden">
                  <AnimatePresence
                    mode="wait"
                    custom={direction}
                  >
                    <motion.span
                      key={activeIndex}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        duration: LABEL_TRANSITION_S,
                        ease: LABEL_EASE,
                      }}
                      className="block"
                    >
                      {String(activeIndex + 1).padStart(2, "0")}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span>
                  &nbsp;—&nbsp;{String(images.length).padStart(2, "0")}
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
