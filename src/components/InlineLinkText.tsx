import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ACCENT_BLUE } from "@/lib/colors";
import { useCurtain } from "@/components/CurtainProvider";
import { getPageLabel } from "@/lib/pageLabel";

// Markdown link syntax: "[Olympe](https://...)" in a content.ts string
// becomes a real link.
const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

// A leading "/" means an in-app route — gets the site's own page transition
// instead of a plain <a>, and never target="_blank".
function isInternalPath(href: string): boolean {
  return href.startsWith("/");
}

// Unlike the site's other links (hover-only underline, fine for obvious
// buttons), inline text needs a permanent marker to signal it's clickable
// at all — underline stays always-on, color still only switches on hover.
export function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { trigger: triggerCurtain } = useCurtain();
  const internal = isInternalPath(href);

  return (
    <a
      href={href}
      target={internal ? undefined : "_blank"}
      rel={internal ? undefined : "noopener noreferrer"}
      onClick={
        internal
          ? (event) => {
              event.preventDefault();
              triggerCurtain(getPageLabel(href), () => navigate(href));
            }
          : undefined
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        color: isHovered ? ACCENT_BLUE : undefined,
        textDecoration: "underline",
        transition: "color 0.3s",
      }}
    >
      {children}
    </a>
  );
}

export interface TextRun {
  text: string;
  href?: string;
}

// Splits text into plain and link runs — shared by InlineLinkText (static)
// and AnimatedParagraph (reveal). Fresh RegExp per call: a shared `g`-flagged
// instance carries lastIndex between calls, breaking every second parse.
export function parseLinkRuns(text: string): TextRun[] {
  const pattern = new RegExp(LINK_PATTERN);
  const runs: TextRun[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    const [whole, label, href] = match;
    if (match.index > lastIndex) {
      runs.push({ text: text.slice(lastIndex, match.index) });
    }
    runs.push({ text: label, href });
    lastIndex = match.index + whole.length;
  }
  if (lastIndex < text.length) runs.push({ text: text.slice(lastIndex) });

  return runs;
}

export function InlineLinkText({ text }: { text: string }) {
  return (
    <>
      {parseLinkRuns(text).map((run, i) =>
        run.href ? (
          <InlineLink
            key={i}
            href={run.href}
          >
            {run.text}
          </InlineLink>
        ) : (
          <span key={i}>{run.text}</span>
        ),
      )}
    </>
  );
}
