"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

// Two flags for the whole site, not one.
//
// `revealed` is the loader handing over: the overlay is gone and whatever plays
// on load may start. Everything that animates in waits on it rather than on its
// own timer, so nothing can slide in behind the white overlay and be sitting
// there when it lifts.
//
// `entered` is the page having finished arriving. A section with an entry
// sequence claims a hold before the handover and releases it when its timeline
// lands; until every hold is released the page must not scroll, or the hero's
// scrub would start eating an intro that is still playing.
//
// Defaults to both done, so anything rendered outside the provider still
// animates normally instead of waiting forever.
const LoaderContext = createContext({
  revealed: true,
  entered: true,
  reveal: () => {},
  holdEntry: () => () => {},
});

export function LoaderProvider({ children }) {
  const [revealed, setRevealed] = useState(false);
  // A count rather than a flag: more than one section may own an entry
  // sequence, and the page is only in when the last of them is done.
  const [holds, setHolds] = useState(0);

  const reveal = useCallback(() => setRevealed(true), []);

  // Returns its own release. Idempotent, so a timeline that both completes and
  // gets cleaned up cannot drop the count below what is actually outstanding.
  const holdEntry = useCallback(() => {
    setHolds((n) => n + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      setHolds((n) => n - 1);
    };
  }, []);

  const entered = revealed && holds === 0;

  const value = useMemo(
    () => ({ revealed, entered, reveal, holdEntry }),
    [revealed, entered, reveal, holdEntry]
  );

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
}

export const useLoader = () => useContext(LoaderContext);
