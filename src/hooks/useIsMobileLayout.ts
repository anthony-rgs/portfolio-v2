import { useEffect, useState } from "react";

const QUERY = "(max-width: 1023px)";

// Sitewide <1024px cutoff — below it, pages render a different component
// tree entirely, since the desktop layout's custom scroll/wheel machinery
// conflicts with normal mobile scrolling.
export function useIsMobileLayout(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const handleChange = () => setIsMobile(mql.matches);
    handleChange();
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}
