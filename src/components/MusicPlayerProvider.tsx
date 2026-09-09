import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { content } from "@/data/content";

const TRACKS = content.tracks;

const VOLUME = 0.22;

interface MusicPlayerContextValue {
  playing: boolean;
  currentIndex: number;
  play: () => void;
  toggle: () => void;
  playTrack: (index: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

interface MusicPlayerProviderProps {
  children: ReactNode;
}

// Owns the single <audio> element for the whole app, mounted unconditionally
// so the track FirstLoadIntro started keeps playing once the real page mounts.
export function MusicPlayerProvider({ children }: MusicPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  // Random starting point only — TRACKS then plays through in order.
  // currentIndex mirrors trackIndexRef for consumers that need to re-render
  // (highlighting the active title); trackIndexRef is the source of truth
  // read inside event handlers.
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * TRACKS.length),
  );
  const trackIndexRef = useRef(currentIndex);

  // src is owned imperatively for the element's whole lifetime (the "ended"
  // handler below also mutates it directly), not via a JSX `src` prop.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = TRACKS[trackIndexRef.current].src;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      trackIndexRef.current = (trackIndexRef.current + 1) % TRACKS.length;
      setCurrentIndex(trackIndexRef.current);
      audio.src = TRACKS[trackIndexRef.current].src;
      audio.play().catch(() => {});
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  const play = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = VOLUME;
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {});
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      play();
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  // Jumps to a specific track — "ended" keeps advancing from wherever this
  // leaves the playlist.
  const playTrack = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    trackIndexRef.current = index;
    setCurrentIndex(index);
    audio.src = TRACKS[index].src;
    audio.volume = VOLUME;
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {});
  };

  // Tab hidden -> pause without touching `playing`, so intent is
  // remembered; visible again -> resume only if that intent was "playing".
  useEffect(() => {
    const handleVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) {
        if (!audio.paused) audio.pause();
      } else if (playing && audio.paused) {
        audio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [playing]);

  return (
    <MusicPlayerContext.Provider
      value={{ playing, currentIndex, play, toggle, playTrack }}
    >
      <audio ref={audioRef} />
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  }
  return ctx;
}
