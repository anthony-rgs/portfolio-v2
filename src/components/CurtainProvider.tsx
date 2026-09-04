import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NameCurtain } from "@/components/NameCurtain";
import { getPageLabel } from "@/lib/pageLabel";

type TriggerCurtain = (label: string, onComplete: () => void) => void;
type TriggerBack = () => void;

interface CurtainContextValue {
  trigger: TriggerCurtain;
  // "Retour" — pops the app's own navigation stack (not browser history)
  // and returns to whatever path was on top.
  triggerBack: TriggerBack;
}

interface CurtainRequest {
  label: string;
  onComplete: () => void;
}

const CurtainContext = createContext<CurtainContextValue | null>(null);

interface CurtainProviderProps {
  children: ReactNode;
}

export function CurtainProvider({ children }: CurtainProviderProps) {
  const [request, setRequest] = useState<CurtainRequest | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  // Every trigger() pushes the path being left; triggerBack pops it. Own
  // stack (not navigate(-1)) so "Retour" retraces exactly this app's steps,
  // regardless of browser history.
  const historyRef = useRef<string[]>([]);

  const trigger = useCallback<TriggerCurtain>(
    (label, onComplete) => {
      historyRef.current.push(location.pathname);
      setRequest({ label, onComplete });
    },
    [location.pathname],
  );

  const triggerBack = useCallback<TriggerBack>(() => {
    const previousPath = historyRef.current.pop() ?? "/";
    setRequest({
      label: getPageLabel(previousPath),
      onComplete: () => navigate(previousPath),
    });
  }, [navigate]);

  return (
    <CurtainContext.Provider value={{ trigger, triggerBack }}>
      {children}
      {request && (
        <NameCurtain
          label={request.label}
          onComplete={() => {
            // navigate()'s state update isn't guaranteed to land in the same
            // batch as setRequest(null) — the destination's PageLoadCurtain
            // could mount a beat late, flashing the old page. Double rAF
            // waits for an actual paint after navigate() before clearing.
            const { onComplete } = request;
            onComplete();
            requestAnimationFrame(() => {
              requestAnimationFrame(() => setRequest(null));
            });
          }}
        />
      )}
    </CurtainContext.Provider>
  );
}

export function useCurtain() {
  const ctx = useContext(CurtainContext);
  if (!ctx) throw new Error("useCurtain must be used within a CurtainProvider");
  return ctx;
}
