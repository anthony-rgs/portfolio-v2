import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { TEXT_COLOR, ACCENT_BLUE } from "@/lib/colors";
import { content } from "@/data/content";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { setWheelLocked } from "@/lib/wheelLock";
import { sampleLuminanceAtPoint } from "@/lib/sampleBackgroundColor";

const TRACKS = content.tracks;

// Angle convention: 0° = right, clockwise (plain atan2(dy, dx) in screen
// space). Arc centers on the up-left diagonal (225°) — the only direction
// with room to open into from a bottom-right corner button.
const ARC_SPAN_DEG = 140;
const ARC_CENTER_DEG = 225;
const ARC_START_DEG = ARC_CENTER_DEG - ARC_SPAN_DEG / 2; // 155
const ARC_END_DEG = ARC_CENTER_DEG + ARC_SPAN_DEG / 2; // 295

// Fade/blur/scale-in transition at each edge of the arc, instead of titles
// popping in/out at a hard cut.
const EDGE_FADE_DEG = 20;
const MAX_BLUR_PX = 6;
// Below this edge-visibility factor a title is still too faded to target.
const INTERACTIVE_VISIBILITY_THRESHOLD = 0.55;

const ANGLE_STEP_DEG = 24;
const TITLE_RADIUS_PX = 80;

// Radius band (on top of the angular sector) that counts as "over the
// player itself" regardless of angle, so hovering the button keeps the menu open.
const HOVER_MIN_RADIUS_PX = 30;
const HOVER_MAX_RADIUS_PX = 190;

// Virtual track slots mounted around the current center — wide enough that
// an ordinary scroll never needs to mount/unmount mid-animation. The window
// only re-centers (a real state update) once rotation drifts near its edge.
const SLOT_WINDOW_RADIUS = 8;
const RECENTER_DRIFT_SLOTS = 5;

// Wheel-driven inertia: each tick adds to a velocity (deg/s), bled off by
// friction each rAF frame rather than stopping dead.
const WHEEL_SENSITIVITY = 0.5;
const FRICTION_PER_SECOND = 0.94 ** 60;
const VELOCITY_STOP_THRESHOLD = 0.02;
// Caps how much a single trackpad burst can jump rotation — an uncapped
// jump could shift the slot window enough to share no keys with the
// previous one, unmounting/remounting every row at once (a visible flash).
const MAX_VELOCITY_DEG_PER_SEC = 720;

// Same motif as the player button's own equalizer bars, scaled down — ties
// "this row is playing" to the same visual language as the button.
const MINI_BARS = [
  { duration: 1.1, delay: 0 },
  { duration: 0.9, delay: 0.15 },
  { duration: 1.3, delay: 0.05 },
];
// Fixed, known size — unlike the title, this piece never changes, so the
// reveal is a straight clip-window animation from 0 to this width.
const PLAYER_WIDTH_PX = 14;

// One shared clock for everything that moves together when a track becomes
// (or stops being) active — the row's outward push, equalizer slide-in, and
// color settle — so it reads as one push, not offset micro-animations.
const SELECT_TRANSITION_S = 0.35;
const SELECT_EASE = [0.4, 0, 0.2, 1] as const;

// Luminance (0-255) below which the sampled background counts as dark
// enough to switch the label to white.
const BG_DARK_THRESHOLD = 140;
// Plain interval, not every animation frame — color only needs to keep up
// with scroll/rotation, not track it at 60fps.
const SAMPLE_INTERVAL_MS = 150;
// A binary white/dark choice alone fails on mid-gray backgrounds — a soft
// halo opposite whichever color got picked buys back the contrast margin.
const WHITE_TEXT_HALO = "0 1px 3px rgba(0, 0, 0, 0.5)";
const DARK_TEXT_HALO = "0 1px 3px rgba(255, 255, 255, 0.5)";

// RevealItem's rise-and-clip technique, applied per row for the open/close
// transition instead of a plain opacity fade.
const REVEAL_DURATION_S = 0.4;

function normalizeAngle(deg: number): number {
  let a = deg % 360;
  if (a < 0) a += 360;
  return a;
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

// Hooks into MusicPlayerProvider (playTrack/currentIndex); rendered as a
// sibling of the player button — see MusicPlayer.tsx.
export function TrackRadialMenu() {
  const { currentIndex, playing, playTrack } = useMusicPlayer();
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = useState(false);

  // Outside React state — the wheel's rAF inertia loop writes to it every
  // frame via .set(), and every slot's angle/position/opacity/blur is a
  // useTransform() derived from it, so a scroll gesture never re-renders React.
  const rotationOffset = useMotionValue(0);
  const [baseK, setBaseK] = useState(0);

  // Claims the wheel while open, so the projects column's own wheel
  // listener ignores the same event — see src/lib/wheelLock.ts.
  useEffect(() => {
    setWheelLocked(isOpen);
    return () => setWheelLocked(false);
  }, [isOpen]);

  // Geometric hover zone: angle + radius from the button's center, not
  // "is the pointer over some DOM element".
  useEffect(() => {
    const measure = () => {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Plain ref, not functional-setState `prev` — this effect registers
  // `handleMove` once (empty deps) and never gets a fresh closure again.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const { x: cx, y: cy } = centerRef.current;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const radius = Math.hypot(dx, dy);
      const overButton = radius <= HOVER_MIN_RADIUS_PX;
      let inSector = false;
      if (!overButton && radius <= HOVER_MAX_RADIUS_PX) {
        const angle = normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI);
        inSector = angle >= ARC_START_DEG && angle <= ARC_END_DEG;
      }
      // Opens only via the button itself. Once open, staying inside the
      // sector (titles or the gaps between them) keeps it open; leaving
      // both closes it.
      const nextOpen = overButton || (wasOpenRef.current && inSector);
      wasOpenRef.current = nextOpen;
      setIsOpen(nextOpen);
    };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  // Wheel-driven rotation with inertia.
  const velocityRef = useRef(0); // deg/s
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const stepInertia = (now: number) => {
      const last = lastFrameRef.current ?? now;
      const dt = Math.min(0.05, (now - last) / 1000);
      lastFrameRef.current = now;

      rotationOffset.set(rotationOffset.get() + velocityRef.current * dt);
      velocityRef.current *= Math.pow(FRICTION_PER_SECOND, dt);

      if (Math.abs(velocityRef.current) < VELOCITY_STOP_THRESHOLD) {
        velocityRef.current = 0;
        rafRef.current = null;
        lastFrameRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(stepInertia);
    };

    const handleWheel = (e: WheelEvent) => {
      if (!isOpen) return;
      // Hijacked only while the menu is actually open, so the page doesn't
      // also scroll underneath.
      e.preventDefault();
      velocityRef.current = Math.max(
        -MAX_VELOCITY_DEG_PER_SEC,
        Math.min(
          MAX_VELOCITY_DEG_PER_SEC,
          velocityRef.current + e.deltaY * WHEEL_SENSITIVITY,
        ),
      );
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(stepInertia);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      // Without resetting these, a stale rafRef id survives into the next
      // effect run (isOpen flips), and handleWheel's null-check never
      // restarts the loop — scrolling looks frozen the second time it opens.
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastFrameRef.current = null;
    };
  }, [isOpen, rotationOffset]);

  // Re-centers the mounted slot window only once live rotation drifts near
  // its edge. Steps baseK by a fixed RECENTER_DRIFT_SLOTS instead of
  // jumping straight to liveK: guarantees the new window always overlaps
  // the old one, so a fast-scroll burst can't unmount every row at once.
  useMotionValueEvent(rotationOffset, "change", (value) => {
    // Sign must match the slot angle formula below (angle = ARC_CENTER -
    // k*STEP - r) or baseK drifts the wrong way, mounting a window nowhere
    // near the visible arc.
    const liveK = Math.round(-value / ANGLE_STEP_DEG);
    setBaseK((prev) => {
      const drift = liveK - prev;
      if (Math.abs(drift) < RECENTER_DRIFT_SLOTS) return prev;
      return prev + Math.sign(drift) * RECENTER_DRIFT_SLOTS;
    });
  });

  const slots = Array.from(
    { length: SLOT_WINDOW_RADIUS * 2 + 1 },
    (_, i) => baseK - SLOT_WINDOW_RADIUS + i,
  );

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
    >
      {slots.map((k) => {
        const trackIndex = mod(k, TRACKS.length);
        return (
          <TrackSlot
            key={k}
            slotIndex={k}
            trackIndex={trackIndex}
            track={TRACKS[trackIndex]}
            rotationOffset={rotationOffset}
            isOpen={isOpen}
            isActive={trackIndex === currentIndex}
            isPlaying={playing}
            onSelect={() => playTrack(trackIndex)}
          />
        );
      })}
    </div>
  );
}

interface TrackSlotProps {
  slotIndex: number;
  trackIndex: number;
  track: (typeof TRACKS)[number];
  rotationOffset: MotionValue<number>;
  isOpen: boolean;
  isActive: boolean;
  isPlaying: boolean;
  onSelect: () => void;
}

function TrackSlot({
  slotIndex,
  trackIndex,
  track,
  rotationOffset,
  isOpen,
  isActive,
  isPlaying,
  onSelect,
}: TrackSlotProps) {
  // mix-blend-mode doesn't work here — this button sits inside several
  // position:fixed/transform ancestors that each spin up their own
  // compositing layer, so it never sees the project photo behind it.
  // Instead reads the real rendered pixel directly: walk the DOM stack at
  // the label's screen point, find the <img> there, sample it via an
  // offscreen canvas — see sampleBackgroundColor.ts. null falls back to
  // the canonical text color, not white.
  //
  // Sampled per character, not per word — a title can span a light/dark
  // boundary in the photo behind it.
  const titleChars = useRef(Array.from(track.title)).current;
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [charDark, setCharDark] = useState<boolean[]>(() =>
    titleChars.map(() => false),
  );
  // Same treatment for the dimmed index number in front of the title.
  const numberRef = useRef<HTMLSpanElement>(null);
  const [numberDark, setNumberDark] = useState(false);

  // Negative slotIndex: within the arc, increasing angle moves a point up
  // the screen — without the minus sign, track order reads bottom-to-top
  // instead of top-to-bottom.
  const angle = useTransform(
    rotationOffset,
    (r) => ARC_CENTER_DEG - slotIndex * ANGLE_STEP_DEG - r,
  );
  const visibility = useTransform(angle, (a) => {
    if (a < ARC_START_DEG || a > ARC_END_DEG) return 0;
    const distFromEdge = Math.min(a - ARC_START_DEG, ARC_END_DEG - a);
    return Math.min(1, distFromEdge / EDGE_FADE_DEG);
  });

  // Titles self-center on their (x,y) point, so a longer label's near edge
  // would sit closer to the player than a shorter one's. Fixed by measuring
  // the label's rendered width and pushing the radius outward by half of
  // it — the near edge lands at exactly TITLE_RADIUS_PX for every title,
  // only the far edge extends with text length.
  //
  // labelRef wraps only number+title (not the player/equalizer) — its width
  // only changes when the title text itself changes, not on selection.
  const labelRef = useRef<HTMLSpanElement>(null);
  const labelWidth = useMotionValue(0);
  const isFirstMeasureRef = useRef(true);
  useLayoutEffect(() => {
    if (!labelRef.current) return;
    const nextWidth = labelRef.current.offsetWidth;
    if (isFirstMeasureRef.current) {
      isFirstMeasureRef.current = false;
      labelWidth.set(nextWidth);
      return;
    }
    animate(labelWidth, nextWidth, {
      duration: SELECT_TRANSITION_S,
      ease: SELECT_EASE,
    });
  }, [labelWidth, track.title]);

  // The equalizer's width, animated between 0 and PLAYER_WIDTH_PX whenever
  // isActive flips — no DOM measurement, the target is always one of two
  // known constants.
  const barsRevealWidth = useMotionValue(isActive ? PLAYER_WIDTH_PX : 0);
  const isFirstBarsRef = useRef(true);
  useEffect(() => {
    if (isFirstBarsRef.current) {
      isFirstBarsRef.current = false;
      return;
    }
    animate(barsRevealWidth, isActive ? PLAYER_WIDTH_PX : 0, {
      duration: SELECT_TRANSITION_S,
      ease: SELECT_EASE,
    });
  }, [isActive, barsRevealWidth]);

  // Both the radial push and self-centering translate react to this one
  // combined width, so title-length changes and player reveal/hide move
  // together as a single push.
  const totalWidth = useTransform(
    [labelWidth, barsRevealWidth],
    ([lw, bw]: number[]) => lw + bw,
  );

  // A CSS "-50% -50%" translate recomputes instantly on new content, before
  // its own animation starts, while the radial push catches up gradually —
  // that mismatch caused an "index/title teleports" bug. Driving the
  // self-center off this same animated totalWidth (px, not a live
  // percentage) keeps both in lockstep.
  const translateValue = useTransform(totalWidth, (w) => `${-w / 2}px -50%`);

  const x = useTransform([angle, totalWidth], ([a, w]: number[]) => {
    const radius = TITLE_RADIUS_PX + w / 2;
    return radius * Math.cos((a * Math.PI) / 180);
  });
  const y = useTransform([angle, totalWidth], ([a, w]: number[]) => {
    const radius = TITLE_RADIUS_PX + w / 2;
    return radius * Math.sin((a * Math.PI) / 180);
  });
  const scale = useTransform(visibility, (v) => 0.85 + v * 0.15);
  const blurFilter = useTransform(
    visibility,
    (v) => `blur(${(1 - v) * MAX_BLUR_PX}px)`,
  );
  // Clock-hand tilt: label rotates to match its radial angle. +180° so text
  // reads outward from the pivot instead of upside down.
  const rotateDeg = useTransform(angle, (a) => `${a + 180}deg`);

  // Mirrors the edge-visibility motion value into React state, only across
  // the interactive threshold, to gate pointer-events/tab order. Seeded
  // from visibility's current value, not false — a derived motion value
  // only emits "change" on a later update, so rows already visible on
  // first hover (before any scroll) would stay unclickable otherwise.
  const [edgeInteractive, setEdgeInteractive] = useState(
    () => visibility.get() >= INTERACTIVE_VISIBILITY_THRESHOLD,
  );
  useMotionValueEvent(visibility, "change", (v) => {
    const next = v >= INTERACTIVE_VISIBILITY_THRESHOLD;
    setEdgeInteractive((prev) => (prev === next ? prev : next));
  });
  const interactive = isOpen && edgeInteractive;

  // Only open, sufficiently visible labels sample their background color.
  useEffect(() => {
    if (!interactive) return;
    const sampleAt = (node: HTMLSpanElement | null) => {
      if (!node) return false;
      const rect = node.getBoundingClientRect();
      const luminance = sampleLuminanceAtPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
      return luminance !== null && luminance < BG_DARK_THRESHOLD;
    };
    const sample = () => {
      setCharDark(charRefs.current.map(sampleAt));
      setNumberDark(sampleAt(numberRef.current));
    };
    sample();
    const id = window.setInterval(sample, SAMPLE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [interactive]);

  // Underline wipe is reserved for hovered-but-not-playing rows — the
  // playing row shows the equalizer instead, so signals never stack.
  const [isHovered, setIsHovered] = useState(false);
  const showAccent = isActive || isHovered;
  const showUnderline = isHovered && !isActive;
  const trackNumber = String(trackIndex + 1).padStart(2, "0");

  return (
    <motion.div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        translate: translateValue,
        rotate: rotateDeg,
        x,
        y,
      }}
    >
      <div className="w-fit overflow-hidden">
        <motion.div
          animate={{ y: isOpen ? "0%" : "100%" }}
          transition={{ duration: REVEAL_DURATION_S, ease: SELECT_EASE }}
        >
          <motion.button
            type="button"
            onClick={onSelect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label={`Lancer ${track.title}`}
            tabIndex={interactive ? 0 : -1}
            style={{
              display: "block",
              position: "relative",
              opacity: visibility,
              scale,
              filter: blurFilter,
              // Feeds currentColor consumers not individually sampled (the
              // equalizer bars) — the title's own color is set further down.
              color: showAccent ? ACCENT_BLUE : TEXT_COLOR,
              pointerEvents: interactive ? "auto" : "none",
            }}
            className="cursor-pointer whitespace-nowrap"
          >
            {/* Wraps only number+title — feeds labelWidth above, unaffected
            by the player reveal below. */}
            <span
              ref={labelRef}
              className="inline-block"
            >
              <span
                ref={numberRef}
                style={{
                  color: showAccent
                    ? ACCENT_BLUE
                    : numberDark
                      ? "#fff"
                      : TEXT_COLOR,
                  textShadow: showAccent
                    ? undefined
                    : numberDark
                      ? WHITE_TEXT_HALO
                      : DARK_TEXT_HALO,
                  opacity: showAccent ? undefined : 0.35,
                }}
                className="mr-1.5 text-[8px] font-normal tabular-nums sm:text-[8px] lg:text-[9px] xl:text-[10px]"
              >
                {trackNumber}
              </span>
              {/* inline-block: a bare inline span is an unreliable
              containing block for the absolutely-positioned underline. */}
              <span className="relative inline-block text-[10px] font-medium sm:text-[11px] lg:text-[13px] xl:text-[14px]">
                {titleChars.map((ch, i) => (
                  <span
                    key={i}
                    ref={(node) => {
                      charRefs.current[i] = node;
                    }}
                    style={{
                      color: showAccent
                        ? ACCENT_BLUE
                        : charDark[i]
                          ? "#fff"
                          : TEXT_COLOR,
                      textShadow: showAccent
                        ? undefined
                        : charDark[i]
                          ? WHITE_TEXT_HALO
                          : DARK_TEXT_HALO,
                    }}
                  >
                    {ch}
                  </span>
                ))}
                <motion.span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0.5 h-px bg-[#1c58f0]"
                  style={{ transformOrigin: isHovered ? "left" : "right" }}
                  animate={{ scaleX: showUnderline ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </span>
            </span>
            {/* Horizontal version of RevealItem's clip technique: a fixed
            inner block, revealed by an overflow-hidden window whose width
            is driven by barsRevealWidth. */}
            <motion.span
              style={{
                display: "inline-block",
                overflow: "hidden",
                verticalAlign: "bottom",
                width: barsRevealWidth,
              }}
            >
              <span
                style={{ width: PLAYER_WIDTH_PX }}
                className="ml-1.5 inline-flex items-end gap-0.5"
              >
                {MINI_BARS.map((bar, i) => (
                  <motion.span
                    key={i}
                    className="block h-2 w-px rounded-full bg-current"
                    animate={
                      isPlaying ? { scaleY: [0.3, 1, 0.3] } : { scaleY: 0.3 }
                    }
                    transition={
                      isPlaying
                        ? {
                            duration: bar.duration,
                            delay: bar.delay,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        : { duration: 0.2 }
                    }
                  />
                ))}
              </span>
            </motion.span>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
