import * as React from "react";
import { useContext } from "react";

export interface GAData {
  gtag: GAFunction;
}
export type GAFunction = (...any) => void;

declare global {
  interface Window {
    gtag?: Function;
  }
}

function gtag(...args) {
  if (typeof window === "object" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

const GAContext = React.createContext<GAData>({ gtag });

/**
 * If we're running in the browser (not being server-side rendered)
 * and if the HTML document includes the Google Analytics snippet that
 * defines the gtag() function, then this provider component makes that
 * gtag() function available to any component via:
 *
 *    const { gtag } = useContext(GAProvider.context)
 *
 * If we're not in a browser or if google analytics is not enabled,
 * then we provide a dummy function that ignores its arguments and
 * does nothing.  The idea is that components can always safely call
 * the function provided by this component.
 */
export function GAProvider(props: { children: React.ReactNode }) {
  return (
    <GAContext.Provider value={{ gtag }}>{props.children}</GAContext.Provider>
  );
}

export function useGA() {
  return useContext(GAContext);
}
