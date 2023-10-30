import * as React from "react";
import * as pageMetric from "./generated/page";
import * as navigatorMetric from "./generated/navigator";
import * as elementMetric from "./generated/element";
import * as pings from "./generated/pings";
import Glean from "@mozilla/glean/web";
import { DEV_MODE, GLEAN_CHANNEL, GLEAN_DEBUG, GLEAN_ENABLED } from "../env";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { useUserData } from "../user-context";
import { handleSidebarClick } from "./sidebar-click";
import { VIEWPORT_BREAKPOINTS } from "./constants";
import { Doc } from "../../../libs/types/document";

export type ViewportBreakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type HTTPStatus = "200" | "404";

const UTM_PARAMETER_NAMES = [
  "source",
  "medium",
  "campaign",
  "term",
  "content",
] as const;
type UTMParameters = Partial<
  Record<(typeof UTM_PARAMETER_NAMES)[number], string>
>;

export type PageProps = {
  referrer: string | undefined;
  path: string | undefined;
  httpStatus: HTTPStatus;
  subscriptionType: string;
  geo: string | undefined;
  geo_iso: string | undefined;
  userAgent: string | undefined;
  viewportBreakpoint: ViewportBreakpoint | undefined;
  viewportRatio: number;
  viewportHorizontalCoverage: number;
  isBaseline?: string;
  utm: UTMParameters;
};

export type PageEventProps = {
  referrer: string | undefined;
  path: string | undefined;
};

export type ElementClickedProps = {
  source: string;
  subscriptionType: string;
};

export type GleanAnalytics = {
  page: (arg: PageProps) => () => void;
  click: (arg: ElementClickedProps) => void;
};

const FIRST_PARTY_DATA_OPT_OUT_COOKIE_NAME = "moz-1st-party-data-opt-out";
const GLEAN_APP_ID = "mdn-yari";

function urlOrNull(url?: string, base?: string | URL) {
  if (!url) {
    return null;
  }
  try {
    return new URL(url, base);
  } catch (_) {
    return null;
  }
}

function glean(): GleanAnalytics {
  if (typeof window === "undefined" || !GLEAN_ENABLED) {
    //SSR return noop.
    return {
      page: (page: PageProps) => () => {},
      click: (element: ElementClickedProps) => {},
    };
  }
  const userIsOptedOut = document.cookie
    .split("; ")
    .includes(`${FIRST_PARTY_DATA_OPT_OUT_COOKIE_NAME}=true`);

  const uploadEnabled = !userIsOptedOut && GLEAN_ENABLED;

  Glean.initialize(GLEAN_APP_ID, uploadEnabled, {
    maxEvents: 1,
    channel: GLEAN_CHANNEL,
    migrateFromLegacyStorage: true,
    serverEndpoint: DEV_MODE
      ? "https://developer.allizom.org"
      : document.location.origin,
  });

  if (DEV_MODE) {
    Glean.setDebugViewTag("mdn-dev");
  }
  Glean.setLogPings(GLEAN_DEBUG);

  const gleanContext = {
    page: (page: PageProps) => {
      const path = urlOrNull(page.path);
      if (path) {
        pageMetric.path.setUrl(path);
      }
      const referrer = urlOrNull(page.referrer, window?.location.href);
      if (referrer) {
        pageMetric.referrer.setUrl(referrer);
      }
      if (page.isBaseline) {
        pageMetric.isBaseline.set(page.isBaseline);
      }
      for (const param in page.utm) {
        pageMetric.utm[param].set(page.utm[param]);
      }
      pageMetric.httpStatus.set(page.httpStatus);
      if (page.geo) {
        navigatorMetric.geo.set(page.geo);
      }
      if (page.geo_iso) {
        navigatorMetric.geo_iso.set(page.geo_iso);
      }
      if (page.userAgent) {
        navigatorMetric.userAgent.set(page.userAgent);
      }
      if (page.viewportBreakpoint) {
        navigatorMetric.viewportBreakpoint.set(page.viewportBreakpoint);
      }
      if (page.viewportRatio) {
        navigatorMetric.viewportRatio.set(page.viewportRatio);
      }
      if (page.viewportHorizontalCoverage) {
        navigatorMetric.viewportHorizontalCoverage.set(
          page.viewportHorizontalCoverage
        );
      }
      navigatorMetric.subscriptionType.set(page.subscriptionType);
      return () => pings.page.submit();
    },
    click: (event: ElementClickedProps) => {
      const { source, subscriptionType: subscription_type } = event;
      elementMetric.clicked.record({
        source,
        subscription_type,
      });
      pings.action.submit();
    },
  };
  const gleanClick = (source: string) => {
    gleanContext.click({
      source,
      subscriptionType: "",
    });
  };
  window?.addEventListener("click", (ev) => {
    handleLinkClick(ev, gleanClick);
    handleButtonClick(ev, gleanClick);
    handleSidebarClick(ev, gleanClick);
  });

  return gleanContext;
}

const gleanAnalytics = glean();
const GleanContext = React.createContext(gleanAnalytics);

function handleButtonClick(ev: MouseEvent, click: (source: string) => void) {
  const button = ev?.target;
  if (button instanceof HTMLButtonElement && button.dataset.glean) {
    click(button.dataset.glean);
  }
}

function handleLinkClick(ev: MouseEvent, click: (source: string) => void) {
  const anchor = ev?.target;
  if (anchor instanceof HTMLAnchorElement) {
    if (anchor.dataset.glean) {
      click(anchor.dataset.glean);
    } else if (anchor.classList.contains("external")) {
      click(`external-link: ${anchor.getAttribute("href") || ""}`);
    }
  }
}

export function GleanProvider(props: { children: React.ReactNode }) {
  return (
    <GleanContext.Provider value={gleanAnalytics}>
      {props.children}
    </GleanContext.Provider>
  );
}

export function useGlean() {
  return React.useContext(GleanContext);
}

export function useGleanPage(pageNotFound: boolean, doc?: Doc) {
  const loc = useLocation();
  const userData = useUserData();
  const path = useRef<String | null>(null);

  return useEffect(() => {
    const submit = gleanAnalytics.page({
      path: window?.location.toString(),
      referrer: document?.referrer,
      // on port 3000 this will always return "200":
      httpStatus: pageNotFound ? "404" : "200",
      userAgent: navigator?.userAgent,
      geo: userData?.geo?.country,
      subscriptionType: userData?.subscriptionType || "anonymous",
      viewportBreakpoint: VIEWPORT_BREAKPOINTS.find(
        ([_, width]) => width <= window.innerWidth
      )?.[0],
      viewportRatio: Math.round((100 * window.innerWidth) / window.innerHeight),
      viewportHorizontalCoverage: Math.round(
        (100 * window.innerWidth) / window.screen.width
      ),
      isBaseline:
        doc?.baseline?.is_baseline === undefined
          ? undefined
          : doc.baseline.is_baseline
          ? "baseline"
          : "not_baseline",
      utm: getUTMParameters(),
    });
    if (typeof userData !== "undefined" && path.current !== loc.pathname) {
      path.current = loc.pathname;
      submit();
    }
  }, [loc.pathname, userData, pageNotFound, doc?.baseline?.is_baseline]);
}

export function useGleanClick() {
  const userData = useUserData();
  const glean = useGlean();
  return React.useCallback(
    (source: string) =>
      glean.click({
        source,
        subscriptionType: userData?.subscriptionType || "none",
      }),
    [glean, userData?.subscriptionType]
  );
}

function getUTMParameters(): UTMParameters {
  const searchParams = new URLSearchParams(document.location.search);
  return UTM_PARAMETER_NAMES.reduce((acc, name): UTMParameters => {
    const param = searchParams.get(`utm_${name}`);
    return param ? { ...acc, [name]: param } : acc;
  }, {});
}
