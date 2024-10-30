import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { useLocation, useNavigationType, useParams } from "react-router-dom";
import { DEFAULT_LOCALE } from "../../libs/constants";
import { isValidLocale } from "../../libs/locale-utils";
import { FeatureId } from "./constants";
import { OFFLINE_SETTINGS_KEY, useUserData } from "./user-context";
import { Theme } from "./types/theme";

// This is a bit of a necessary hack!
// The only reason this list is needed is because of the PageNotFound rendering.
// If someone requests `https://domain/some-random-word` what will happen is that
// Lambda@Edge will send the `build/en-us/_spas/404.html` rendered page. That
// rendered page has all the React stuff like routing.
// The <App/> component can know what it needs to render but what's problematic
// is that all and any other app will think that the locale is `some-random-word`
// just because it's the first portion of the URL.
// So, for example, the top navbar will think it can use the `useLocale()` hook
// and get the current locale from the react-router context. Now the navbar menu
// items, for example, will think the locale is `some-random-word` and make links
// like `/some-random-word/docs/Web`.

export function useLocale() {
  const { locale } = useParams();
  return isValidLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function useOnClickOutside(ref, handler) {
  React.useEffect(
    () => {
      const listener = (event) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }

        handler(event);
      };

      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);

      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  );
}

function getCurrentTheme(): Theme {
  const { classList } = document.documentElement;

  const themes: Theme[] = ["os-default", "dark", "light"];
  for (const theme of themes) {
    if (classList.contains(theme)) {
      return theme;
    }
  }

  // Fallback.
  return "light";
}

export function useTheme() {
  const isServer = useIsServer();
  const [theme, setTheme] = useState<Theme>();

  useEffect(() => {
    if (isServer) {
      return;
    }

    const updateScheme = () => setTheme(getCurrentTheme());

    // Update once.
    updateScheme();

    // Listen for changes.
    const observer = new MutationObserver(updateScheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [isServer]);

  return theme;
}

export function useOnlineStatus(): { isOnline: boolean; isOffline: boolean } {
  const isServer = useIsServer();
  const trueStatus = useTrueOnlineStatus();
  // ensure we don't get a hydration error due to mismatched markup:
  return isServer ? { isOnline: true, isOffline: false } : trueStatus;
}

export function useTrueOnlineStatus(): {
  isOnline: boolean;
  isOffline: boolean;
} {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window === "undefined" ? false : window.navigator.onLine
  );
  const isOffline = useMemo(() => !isOnline, [isOnline]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return { isOnline, isOffline };
}

/**
 * If we want to render different markup on client/server, we have to delay this
 * until the first client render. Otherwise, hydration will throw an error, or
 * more dangerously, correlate its v-dom with the wrong markup.
 */
export function useIsServer(): boolean {
  const [isServer, setIsServer] = useState(true);
  useEffect(() => setIsServer(false), []);
  return isServer;
}

export function useScrollToTop() {
  const navigationType = useNavigationType();
  const location = useLocation();
  useEffect(() => {
    if (navigationType === "PUSH") document.documentElement.scrollTo(0, 0);
  }, [navigationType, location]);
}

export function useViewedState() {
  const isServer = useIsServer();
  const key = (id: FeatureId) => `viewed.${id}`;

  return {
    isViewed: (id: FeatureId) => {
      if (isServer) {
        // Avoids the dot from popping up quickly on each load.
        return true;
      }
      try {
        return !!window?.localStorage?.getItem(key(id));
      } catch (e) {
        console.warn("Unable to read viewed state from localStorage", e);
        return false;
      }
    },
    setViewed: (id: FeatureId) => {
      if (isServer) {
        return;
      }
      try {
        window?.localStorage?.setItem(key(id), Date.now().toString());
      } catch (e) {
        console.warn("Unable to write viewed state to localStorage", e);
      }
    },
  };
}

export function usePing() {
  const { isOnline } = useTrueOnlineStatus();
  const user = useUserData();

  React.useEffect(() => {
    try {
      const nextPing = new Date(localStorage.getItem("next-ping") || 0);
      if (
        navigator.sendBeacon &&
        isOnline &&
        user?.isAuthenticated &&
        nextPing < new Date()
      ) {
        const params = new URLSearchParams();

        // fetch offline settings from local storage as its
        // values are very inconsistent in the user context
        const offlineSettings = JSON.parse(
          localStorage.getItem(OFFLINE_SETTINGS_KEY) || "{}"
        );
        if (offlineSettings?.offline) params.set("offline", "true");

        navigator.sendBeacon("/api/v1/ping", params);

        const newNextPing = new Date();
        newNextPing.setUTCDate(newNextPing.getUTCDate() + 1);
        newNextPing.setUTCHours(0);
        newNextPing.setUTCMinutes(0);
        newNextPing.setUTCSeconds(0);
        newNextPing.setUTCMilliseconds(0);
        localStorage.setItem("next-ping", newNextPing.toISOString());
      }
    } catch (e) {
      console.error("Failed to send ping", e);
    }
  }, [isOnline, user]);
}

function getIsDocumentHidden() {
  if (typeof document !== "undefined") {
    return !document.hidden;
  }
  return false;
}

export function usePageVisibility() {
  const [isVisible, setIsVisible] = React.useState(getIsDocumentHidden());
  const onVisibilityChange = () => setIsVisible(getIsDocumentHidden());
  useEffect(() => {
    if (typeof document !== "undefined") {
      const visibilityChange = "visibilitychange";
      document.addEventListener(visibilityChange, onVisibilityChange, false);
      return () => {
        document.removeEventListener(visibilityChange, onVisibilityChange);
      };
    }
  });
  return isVisible;
}

export function useIsIntersecting(
  node: HTMLElement | undefined,
  options: IntersectionObserverInit
) {
  const [isIntersectingState, setIsIntersectingState] = useState(false);
  useEffect(() => {
    if (node && window.IntersectionObserver) {
      const intersectionObserver = new IntersectionObserver((entries) => {
        const [{ isIntersecting = false } = {}] = entries;
        setIsIntersectingState(isIntersecting);
      }, options);
      intersectionObserver.observe(node);
      return () => {
        intersectionObserver.disconnect();
      };
    }
  }, [node, options]);
  return isIntersectingState;
}

export const useScrollToAnchor = () => {
  const scrolledRef = React.useRef(false);
  const { hash } = useLocation();
  React.useEffect(() => {
    if (hash && !scrolledRef.current) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "instant" });
        scrolledRef.current = true;
      }
    }
  });
};

interface ViewedTimer {
  timeout: number | null;
}

export function useViewed(
  callback: Function,
  intersectionObserverOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5,
  }
) {
  const timer = useRef<ViewedTimer>({ timeout: null });
  const isVisible = usePageVisibility();
  const [node, setNode] = useState<HTMLElement | undefined>();
  const isIntersecting = useIsIntersecting(node, intersectionObserverOptions);

  useEffect(() => {
    if (timer.current.timeout !== -1) {
      // timeout !== -1 means the viewed has not been sent
      if (isVisible && isIntersecting) {
        if (timer.current.timeout === null) {
          timer.current = {
            timeout: window.setTimeout(() => {
              timer.current = { timeout: -1 };
              setNode(undefined);
              callback();
            }, 1000),
          };
        }
      }
    }
    return () => {
      if (timer.current.timeout !== null && timer.current.timeout !== -1) {
        clearTimeout(timer.current.timeout);
        timer.current = { timeout: null };
      }
    };
  }, [isVisible, isIntersecting, callback]);

  return useCallback((node: HTMLElement | null) => {
    if (node) {
      setNode(node);
    }
  }, []);
}
