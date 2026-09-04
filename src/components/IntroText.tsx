import { cn } from "@/lib/utils";
import { AnimatedParagraph } from "@/components/AnimatedParagraph";
import { DimmedLabel } from "@/components/DimmedLabel";
import { REVEAL_STAGGER_S, RevealItem } from "@/components/RevealItem";

// Own wave, ahead of REVEAL_BASE_DELAY_S ("le reste") — same timing on
// every page this is used on.
export const INTRO_TITLE_DELAY_S = 0.55;
export const INTRO_SUBTITLE_DELAY_S = 0.7;

interface IntroSubtitleProps {
  lines: string[];
  delay: number;
  className?: string;
}

// The subtitle/description block on its own — extracted so a page that
// splits it away from the title (InfoPage's mobile layout puts a photo
// between them) can reuse it. IntroText below is just this glued under a title.
export function IntroSubtitle({ lines, delay, className }: IntroSubtitleProps) {
  return (
    <div
      className={cn(
        "leading-normal text-[#030D26]/60 lg:leading-tight",
        className,
      )}
    >
      {lines.map((line, i) =>
        line === "" ? (
          <div
            key={i}
            aria-hidden
            className="h-3"
          />
        ) : (
          <p
            key={i}
            className="mb-1"
          >
            <AnimatedParagraph
              text={line}
              delay={delay + i * REVEAL_STAGGER_S}
            />
          </p>
        ),
      )}
    </div>
  );
}

interface IntroTextProps {
  // Tags above the title, joined with "-". Empty = no headline row.
  headline?: string[];
  titleLines: string[];
  // Each entry is its own paragraph; an empty entry is a paragraph break.
  subtitleLines: string[];
  titleDelay?: number;
  subtitleDelay?: number;
}

// The "headline + title + subtitle" block — same size/position/typography
// wherever it's used (home, project pages), just different content.
export function IntroText({
  headline,
  titleLines,
  subtitleLines,
  titleDelay = INTRO_TITLE_DELAY_S,
  subtitleDelay = INTRO_SUBTITLE_DELAY_S,
}: IntroTextProps) {
  return (
    <div>
      {/* w-full whitespace-normal overrides RevealItem's default w-fit/
          whitespace-nowrap, so the headline row's flex-wrap can actually wrap. */}
      {headline && headline.length > 0 && (
        <RevealItem
          delay={titleDelay - REVEAL_STAGGER_S}
          className="mb-6 w-full whitespace-normal"
        >
          <DimmedLabel>
            <span className="flex flex-wrap items-center gap-2">
              {headline.map((word, i) => (
                <span
                  key={word}
                  className="flex items-center gap-2"
                >
                  {i > 0 && <span aria-hidden>-</span>}
                  {word}
                </span>
              ))}
            </span>
          </DimmedLabel>
        </RevealItem>
      )}
      <h1 className="text-[9vw] font-black uppercase leading-[0.9] tracking-tighter sm:text-[7vw] lg:text-[5.2vw]">
        {titleLines.map((line, i) => (
          <RevealItem
            key={i}
            delay={titleDelay + i * REVEAL_STAGGER_S}
            className="pr-0.5"
          >
            {line}
          </RevealItem>
        ))}
      </h1>
      <IntroSubtitle
        lines={subtitleLines}
        delay={subtitleDelay}
        // xl bump: on very large screens the subtitle stayed too small next
        // to the vw-based title, which keeps growing.
        className="mt-6 w-full max-w-full sm:max-w-[55vw] text-[14px] lg:text-base xl:text-[20px]"
      />
    </div>
  );
}
