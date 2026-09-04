import { useEffect, useState } from "react";

// Generic version of useIsMobileLayout's matchMedia pattern, for one-off
// breakpoints (e.g. InfoPage's own 1300px column threshold).
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handleChange = () => setMatches(mql.matches);
    handleChange();
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}
