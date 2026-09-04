import { memo, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame } from "framer-motion";
import { content } from "@/data/content";
import { cn } from "@/lib/utils";

// Floor on how long this stays up, so it reads as an intentional beat, not
// a flash, even if everything resolves instantly.
const MIN_DURATION_MS = 1000;
// Extra hold after the counter hits 100, so the displayed number has time
// to lerp up and settle before the curtain falls.
const COUNTER_CATCH_UP_MS = 400;
const FALL_TRANSITION = { duration: 0.7, ease: [0.4, 0, 0.2, 1] as const };
const SWAP_TRANSITION = { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const };
// Mobile browsers commonly never fire canplaythrough for a preloaded
// <audio> without a prior user gesture — races every preload task against
// this so one that never resolves can't stall the counter forever.
const PRELOAD_TIMEOUT_MS = 4000;

const NAME = "Anthony  Ringressi";
const NAME_EASE = [0.16, 1, 0.3, 1] as const;
// Tuned so NAME_START_DELAY_S + 16 * LETTER_STAGGER_S + LETTER_DURATION_S
// (16 = last of 17 chars, 0-indexed) = 1.2s, the full reveal duration.
const LETTER_DURATION_S = 0.83;
const LETTER_STAGGER_S = 0.02;
const NAME_START_DELAY_S = 0.05;

const NAME_HORIZONTAL_PADDING_PX = 32;
const MEASURE_FONT_SIZE_PX = 100;
// Scales the exact-fit size down further, on top of the fixed padding
// above. Bigger on mobile (<1024px) — the desktop scale read as too small
// on a narrow phone screen.
const NAME_SIZE_SCALE_DESKTOP = 0.6;
const NAME_SIZE_SCALE_MOBILE = 0.97;

// The exact face this measures/displays with — matters specifically here,
// not just document.fonts.ready (see below).
const FONT_LOAD_SPEC = '900 100px "AktivGrotesk"';
// A warm-cache refresh can resolve fonts.load() in well under a frame — this
// is the floor that guarantees a genuine "hidden" frame paints first
// regardless, so the reveal never looks like it skipped a beat.
const MIN_REVEAL_DELAY_MS = 120;

// memo: FirstLoadIntro's own useAnimationFrame re-renders it every frame for
// the counter (~1.4s) — without memo, this child (unrelated to the counter)
// re-rendered right along with it. Now only its own `verified` flip re-renders it.
const AnimatedName = memo(function AnimatedName() {
  // Hidden, purely for measuring — never animated, never visible.
  const measureRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(MEASURE_FONT_SIZE_PX);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const mountedAt = performance.now();

    const measure = () => {
      const node = measureRef.current;
      if (!node) return;
      node.style.fontSize = `${MEASURE_FONT_SIZE_PX}px`;
      const naturalWidth = node.scrollWidth;
      if (naturalWidth === 0) return;
      const availableWidth = window.innerWidth - NAME_HORIZONTAL_PADDING_PX * 2;
      const scale =
        window.innerWidth < 1024
          ? NAME_SIZE_SCALE_MOBILE
          : NAME_SIZE_SCALE_DESKTOP;
      setFontSize((availableWidth / naturalWidth) * MEASURE_FONT_SIZE_PX * scale);
    };

    const start = async () => {
      // document.fonts.load() explicitly tracks this exact face/weight —
      // measuring blind risked verifying against a fallback font (if
      // AktivGrotesk hadn't swapped in yet) that then overflows once the
      // real face loads asynchronously.
      if (document.fonts) {
        try {
          await document.fonts.load(FONT_LOAD_SPEC);
          await document.fonts.ready;
        } catch {
          // Missing font file / network error — proceed with fallback.
        }
      }
      if (cancelled) return;
      measure();
      const elapsed = performance.now() - mountedAt;
      const remaining = Math.max(0, MIN_REVEAL_DELAY_MS - elapsed);
      window.setTimeout(() => {
        if (cancelled) return;
        // rAF on top of the wall-clock floor: guarantees verified flips on
        // a frame boundary, not mid-task.
        requestAnimationFrame(() => {
          if (!cancelled) setVerified(true);
        });
      }, remaining);
    };

    start();
    window.addEventListener("resize", measure);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <>
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: "fixed",
          visibility: "hidden",
          whiteSpace: "nowrap",
          paddingInline: NAME_HORIZONTAL_PADDING_PX,
        }}
        className="font-aktiv font-black tracking-tight uppercase"
      >
        {NAME}
      </div>
      {/* Mounted only once the size is verified, so initial->animate plays
          exactly once with no timing to coordinate against a measurement. */}
      {verified && (
        <h1
          style={{ fontSize, paddingInline: NAME_HORIZONTAL_PADDING_PX }}
          className="font-aktiv flex font-black tracking-tight uppercase"
        >
          {NAME.split("").map((char, index) => (
            <span
              key={index}
              className="inline-block overflow-hidden"
            >
              <motion.span
                className="inline-block"
                initial={{ y: "110%", opacity: 0, filter: "blur(10px)" }}
                animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                transition={{
                  duration: LETTER_DURATION_S,
                  delay: NAME_START_DELAY_S + index * LETTER_STAGGER_S,
                  ease: NAME_EASE,
                }}
              >
                {char === " " ? " " : char}
              </motion.span>
            </span>
          ))}
        </h1>
      )}
    </>
  );
});

// Races a preload promise against a flat timeout — resolves either way, so
// a task whose "loaded" event never fires still lets the counter reach 100.
function withTimeout(task: Promise<void>): Promise<void> {
  return new Promise((resolve) => {
    const timeout = window.setTimeout(resolve, PRELOAD_TIMEOUT_MS);
    task.then(() => {
      window.clearTimeout(timeout);
      resolve();
    });
  });
}

function preloadImage(src: string): Promise<void> {
  return withTimeout(
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // don't let a broken image hold the intro hostage
      img.src = src;
    }),
  );
}

function preloadAudio(src: string): Promise<void> {
  return withTimeout(
    new Promise((resolve) => {
      const audio = new Audio();
      // canplaythrough, not "fully downloaded" — enough buffered to play
      // without stalling, without waiting longer than needed.
      audio.oncanplaythrough = () => resolve();
      audio.onerror = () => resolve();
      audio.preload = "auto";
      audio.src = src;
    }),
  );
}

interface FirstLoadIntroProps {
  // Fires once the curtain starts falling — the real page isn't rendered
  // until then, so its entrance animations play for real instead of
  // finishing invisibly behind this screen.
  onDone: () => void;
}

// Plays once per real page load. Preloads the project images + fonts this
// same request will need in a moment, shows the name + a real progress
// counter while that happens, then drops away like a curtain.
export function FirstLoadIntro({ onDone }: FirstLoadIntroProps) {
  const [visible, setVisible] = useState(true);
  const [falling, setFalling] = useState(false);
  const [displayPercent, setDisplayPercent] = useState(0);
  // Once loading finishes, waits for the user to press the screen rather
  // than falling on its own.
  const [readyToPress, setReadyToPress] = useState(false);

  const mountedAtRef = useRef(performance.now());
  // 0..1 real load progress, read every frame rather than driving its own re-render.
  const loadedFractionRef = useRef(0);
  const currentRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const fontsReady: Promise<void> = document.fonts
      ? document.fonts.ready.then(() => undefined)
      : Promise.resolve();
    // Music is desktop-only (MusicPlayer) — preloading audio on mobile was
    // the actual cause of the loader hanging (canplaythrough often never
    // fires there; withTimeout is still a safety net, just not load-bearing here).
    const isMobileLayout = window.innerWidth < 1024;
    const tasks: Promise<void>[] = [
      ...content.projects.map((project) => preloadImage(project.src)),
      ...(isMobileLayout
        ? []
        : content.tracks.map((track) => preloadAudio(track.src))),
      fontsReady,
    ];
    const total = tasks.length;
    let resolvedCount = 0;

    tasks.forEach((task) => {
      task.then(() => {
        resolvedCount += 1;
        loadedFractionRef.current = resolvedCount / total;
      });
    });
  }, []);

  useAnimationFrame(() => {
    // Whichever of the two is further behind gates the displayed number —
    // an early real load doesn't jump the counter ahead of MIN_DURATION_MS,
    // and a slow real load isn't hidden behind a timer that finished first.
    const timeFraction = Math.min(
      1,
      (performance.now() - mountedAtRef.current) / MIN_DURATION_MS,
    );
    const target = Math.min(loadedFractionRef.current, timeFraction) * 100;

    currentRef.current += (target - currentRef.current) * 0.15;
    const rounded = Math.min(100, Math.round(currentRef.current));
    setDisplayPercent((previous) =>
      previous === rounded ? previous : rounded,
    );

    if (
      !doneRef.current &&
      loadedFractionRef.current >= 1 &&
      timeFraction >= 1 &&
      rounded >= 100
    ) {
      doneRef.current = true;
      window.setTimeout(() => setReadyToPress(true), COUNTER_CATCH_UP_MS);
    }
  });

  const handlePress = () => {
    if (!readyToPress || falling) return;
    // The curtain keeps falling below, independent of onDone — the real
    // page mounts as it starts falling rather than once it's fully gone.
    setFalling(true);
    onDone();
  };

  useEffect(() => {
    if (!falling) return;
    const timeout = window.setTimeout(
      () => setVisible(false),
      FALL_TRANSITION.duration * 1000,
    );
    return () => window.clearTimeout(timeout);
  }, [falling]);

  if (!visible) return null;

  return (
    <motion.div
      onClick={handlePress}
      className={cn(
        "fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-1 bg-black text-white lg:gap-4",
        readyToPress && "cursor-pointer",
      )}
      animate={{ y: falling ? "100%" : "0%" }}
      transition={FALL_TRANSITION}
    >
      <AnimatedName />
      {/* mode="wait": the 100 sinks out first, then "Appuyer sur l'écran"
          rises in — a disappear-then-appear beat, not a cross-fade. */}
      <AnimatePresence mode="wait">
        {readyToPress ? (
          <div
            key="press"
            className="mt-2 w-fit overflow-hidden whitespace-nowrap lg:mt-6"
          >
            <motion.span
              className="font-extralight block text-[26px] opacity-50 sm:text-[30px] lg:text-[30px] xl:text-[34px]"
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "100%" }}
              transition={SWAP_TRANSITION}
            >
              {/* Nested element: keeps the rise-in/out transform and the
                  looping pulse as independent animations. */}
              <motion.span
                className="block"
                animate={{ opacity: [1, 0.65, 1] }}
                transition={{
                  duration: 1.8,
                  delay: SWAP_TRANSITION.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Appuyer sur l'écran
              </motion.span>
            </motion.span>
          </div>
        ) : (
          <div
            key="percent"
            className="mt-2 w-fit overflow-hidden whitespace-nowrap lg:mt-6"
          >
            <motion.span
              className="font-extralight block text-[26px] tabular-nums opacity-50 sm:text-[30px] lg:text-[30px] xl:text-[34px]"
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "100%" }}
              transition={SWAP_TRANSITION}
            >
              {displayPercent}
            </motion.span>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
