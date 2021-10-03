import * as React from "react";
import { useContext, useEffect, useState } from "react";

export type GAFunction = (...any) => void;

const GA_SESSION_STORAGE_KEY = "ga";

function getPostponedEvents() {
  let value;
  try {
    value = sessionStorage.getItem(GA_SESSION_STORAGE_KEY);
  } catch (e) {
    // No sessionStorage support
    return [];
  }
  return JSON.parse(value || JSON.stringify([]));
}

/**
 * Saves given events into sessionStorage so that they are sent once the next
 * page has loaded. This should be used for events that need to be sent without
 * delaying navigation to a new page (which would cancel pending network
 * requests).
 */
export function gaSendOnNextPage(newEvents: any[]) {
  const events = getPostponedEvents();
  const value = JSON.stringify(events.concat(newEvents));
  try {
    sessionStorage.setItem(GA_SESSION_STORAGE_KEY, value);
  } catch (e) {
    // No sessionStorage support
  }
}

declare global {
  interface Window {
    ga?: Function;
  }
}

function ga(...args) {
  if (typeof window === "object" && typeof window.ga === "function") {
    window.ga(...args);
  }
}

const GAContext = React.createContext<GAFunction>(ga);

/**
 * If we're running in the browser (not being server-side rendered)
 * and if the HTML document includes the Google Analytics snippet that
 * defines the ga() function, then this provider component makes that
 * ga() function available to any component via:
 *
 *    let ga = useContext(GAProvider.context)
 *
 * If we're not in a browser or if google analytics is not enabled,
 * then we provide a dummy function that ignores its arguments and
 * does nothing.  The idea is that components can always safely call
 * the function provided by this component.
 */
export function GAProvider(props: { children: React.ReactNode }) {
  /**
   * Checks for the existence of postponed analytics events, which we store
   * in sessionStorage. It also clears them so that they aren't sent again.
   */
  useEffect(() => {
    const events = getPostponedEvents();
    try {
      sessionStorage.removeItem(GA_SESSION_STORAGE_KEY);
    } catch (e) {
      // No sessionStorage support
    }
    for (const event of events) {
      ga("send", event);
    }
  }, []);

  return <GAContext.Provider value={ga}>{props.children}</GAContext.Provider>;
}

// This is a custom hook to return the GA client id. It returns the
// empty string until (and unless) it can determine that id from the GA object.
export function useClientId() {
  const [clientId, setClientId] = useState<string>("");
  const ga = useContext(GAContext);
  useEffect(() => {
    ga((tracker) => {
      setClientId(tracker.get("clientId"));
    });
  }, [ga]);

  return clientId;
}

export function useGA() {
  return useContext(GAContext);
}
