import { useEffect, useRef, useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";

// Copies `text`, flips `copied` true, then back false after `holdMs` —
// shared by HomeIntro's email swap and Navbar's Contact confirmation.
export function useCopiedState(text: string, holdMs: number) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const copy = () => {
    copyToClipboard(text);
    setCopied(true);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(false), holdMs);
  };

  return { copied, copy };
}
