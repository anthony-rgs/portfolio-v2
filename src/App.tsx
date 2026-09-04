import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { HomeIndexPage } from "@/components/HomeIndexPage";
import { ProjectPage } from "@/components/ProjectPage";
import { InfoPage } from "@/components/InfoPage";
import { PageLoadCurtain } from "@/components/PageLoadCurtain";
import { CurtainProvider } from "@/components/CurtainProvider";
import { FirstLoadIntro } from "@/components/FirstLoadIntro";
import { MusicPlayer } from "@/components/MusicPlayer";
import { MusicPlayerProvider } from "@/components/MusicPlayerProvider";

function AppRoutes() {
  const location = useLocation();
  // Skips PageLoadCurtain on this very first render — FirstLoadIntro just
  // dropped away, so replaying the same cover-reveal would double-flash.
  const hasMountedRef = useRef(false);
  const isFirstMount = !hasMountedRef.current;

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<HomeIndexPage />}
        />
        <Route
          path="/projects/:slug"
          element={<ProjectPage />}
        />
        <Route
          path="/about"
          element={<InfoPage />}
        />
      </Routes>
      {!isFirstMount && <PageLoadCurtain key={location.pathname} />}
    </>
  );
}

function App() {
  // The page mounts (and its entrance animations start timing themselves)
  // as soon as the curtain starts falling, not once it's fully gone — a
  // head start instead of a blank beat once it clears.
  const [loaded, setLoaded] = useState(false);

  return (
    <MusicPlayerProvider>
      <FirstLoadIntro onDone={() => setLoaded(true)} />
      {loaded && (
        <BrowserRouter>
          <CurtainProvider>
            <AppRoutes />
            <MusicPlayer />
          </CurtainProvider>
        </BrowserRouter>
      )}
    </MusicPlayerProvider>
  );
}

export default App;
