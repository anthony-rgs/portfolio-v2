import { useState } from "react";
import { ACCENT_BLUE } from "@/lib/colors";
import type { ProjectLink } from "@/data/content";
import { DimmedLabel } from "@/components/DimmedLabel";
import { REVEAL_STAGGER_S } from "@/components/RevealItem";
import { RevealItemFixed } from "@/components/RevealItemFixed";

// REVEAL_STAGGER_S (0.12s) is tuned for major page sections — a 5+ tag list
// on that clock would take noticeably longer than it should.
const TAG_STAGGER_S = 0.03;

interface ProjectMetaProps {
  tools: string[];
  links: ProjectLink[];
  startDelay: number;
}

// Mirrors Navbar's BackLink: arrow points right and sits after the text
// instead of left-before. Same "icon static, text gets hover" split.
export function ExternalLink({
  text,
  link,
}: Pick<ProjectLink, "text" | "link">) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="inline-flex cursor-pointer items-center gap-1.5"
    >
      <span
        style={{
          position: "relative",
          color: isHovered ? ACCENT_BLUE : undefined,
          transition: "color 0.3s",
        }}
      >
        {text}
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 2,
            height: 1,
            background: ACCENT_BLUE,
            transformOrigin: isHovered ? "left" : "right",
            transform: `scaleX(${isHovered ? 1 : 0})`,
            transition: "transform 0.4s ease-out",
          }}
        />
      </span>
      {/* Nudge stays unrotated — composing translate + rotate on the same
          element would send it diagonally wrong. */}
      <span
        style={{
          display: "inline-block",
          transform: isHovered ? "translate(4px, -4px)" : "translate(0, 0)",
          transition: "transform 0.3s ease",
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          // -rotate-45: tilts the horizontal right-arrow up into the classic
          // "external link" diagonal (↗) instead of pointing straight right.
          className="mb-0.5 -rotate-45"
        >
          <path d="M1 5H9M9 5L5.5 1.5M9 5L5.5 8.5" />
        </svg>
      </span>
    </a>
  );
}

// Each link is its own "label above button" block, same as Contact/CV.
// Tools and each link can be empty/absent independently, no leftover gap.
export function ProjectMeta({
  tools,
  links,
  startDelay,
}: ProjectMetaProps) {
  if (tools.length === 0 && links.length === 0) return null;

  return (
    // flex-col, not flex-wrap: Outils always on its own row, links on the
    // row underneath — a deliberate two-row stack, not "wrap only if it
    // doesn't fit" (inconsistent depending on content length).
    <footer className="flex w-full flex-col gap-y-4 text-[14px] sm:text-[13px] lg:text-[14px] xl:text-[16px]">
      {tools.length > 0 && (
        <div>
          <RevealItemFixed delay={startDelay}>
            <DimmedLabel>Outils</DimmedLabel>
          </RevealItemFixed>
          {/* Each tag is its own RevealItemFixed — a single shared box
              (overflow-hidden/whitespace-nowrap) would fight a wrapping list. */}
          <div className="mt-1 flex w-full flex-wrap items-center gap-x-2 gap-y-1 sm:max-w-xs">
            {tools.map((tool, i) => (
              <RevealItemFixed
                key={tool}
                delay={startDelay + REVEAL_STAGGER_S + i * TAG_STAGGER_S}
              >
                <span className="flex items-center gap-2">
                  <div>
                    {tool}
                    {i + 1 !== tools?.length && <span aria-hidden>,</span>}
                  </div>
                </span>
              </RevealItemFixed>
            ))}
          </div>
        </div>
      )}
      {/* One shared flex-wrap group so links wrap as a single unit — not
          each link as its own outer-row item, which split them across
          lines independently. */}
      {links.length > 0 && (
        <div className="flex flex-wrap gap-x-10 gap-y-4 min-[1024px]:flex-nowrap">
          {links.map((l, i) => {
            // TAG_STAGGER_S between links — REVEAL_STAGGER_S is reserved
            // for the label-to-button offset, same as Contact/CV.
            const labelDelay =
              startDelay + REVEAL_STAGGER_S * 2 + i * TAG_STAGGER_S;
            return (
              <div key={l.label}>
                <RevealItemFixed delay={labelDelay}>
                  <DimmedLabel>{l.label}</DimmedLabel>
                </RevealItemFixed>
                {/* pt-2 -mt-2 pr-2: grows the clip box for the icon's hover
                    nudge without pushing the button down. */}
                <RevealItemFixed
                  delay={labelDelay + REVEAL_STAGGER_S}
                  className="-mt-2 pt-2 pr-2"
                >
                  <ExternalLink
                    text={l.text}
                    link={l.link}
                  />
                </RevealItemFixed>
              </div>
            );
          })}
        </div>
      )}
    </footer>
  );
}
