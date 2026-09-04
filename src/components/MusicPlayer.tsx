import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { TEXT_COLOR } from "@/lib/colors";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import { TrackRadialMenu } from "@/components/TrackRadialMenu";
// Own fixed clock, not RevealItem's page-wide wave — PageLoadCurtain clears
// ~0.88s after mounting on every navigation, so 1s gives a beat of clear air.
const REVEAL_DELAY_S = 1;
const REVEAL_DURATION_S = 0.6;
const REVEAL_EASE = [0.4, 0, 0.2, 1] as const;

// Different duration/delay per bar so they don't move in lockstep — paced
// like ambient music, not a hyperactive equalizer.
const BARS = [
  { duration: 1.3, delay: 0 },
  { duration: 1.1, delay: 0.2 },
  { duration: 1.5, delay: 0.1 },
  { duration: 1.0, delay: 0.3 },
];

// Fixed bottom-right. Playback is owned by MusicPlayerProvider — this is
// just a manual play/pause toggle. TrackRadialMenu (sibling) owns its own
// hover/scroll geometry around this button.
export function MusicPlayer() {
  const { playing, toggle } = useMusicPlayer();
  // MusicPlayer never remounts on navigation (mounted once at the app root)
  // — keying this wrapper to the path forces framer-motion to treat it as
  // fresh each route change, replaying initial->animate.
  const location = useLocation();
  const isMobileLayout = useIsMobileLayout();

  if (isMobileLayout) return null;

  return (
    <div className="fixed right-3 bottom-2 z-30">
      <div
        key={location.pathname}
        className="w-fit overflow-hidden"
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          transition={{
            duration: REVEAL_DURATION_S,
            delay: REVEAL_DELAY_S,
            ease: REVEAL_EASE,
          }}
        >
          <button
            type="button"
            onClick={toggle}
            aria-label={
              playing ? "Mettre la musique en pause" : "Lancer la musique"
            }
            aria-pressed={playing}
            style={{ color: TEXT_COLOR }}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center gap-[3px]"
          >
            {BARS.map((bar, i) => (
              <motion.span
                key={i}
                className="block h-3 w-[2px] rounded-full bg-current"
                animate={playing ? { scaleY: [0.3, 1, 0.3] } : { scaleY: 0.3 }}
                transition={
                  playing
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
          </button>
        </motion.div>
      </div>

      <TrackRadialMenu />
    </div>
  );
}
