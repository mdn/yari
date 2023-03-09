import * as React from "react";
import * as pageMetric from "./generated/page";
import * as navigatorMetric from "./generated/navigator";
import * as elementMetric from "./generated/element";
import * as pings from "./generated/pings";
import Glean from "@mozilla/glean/web";
import { DEV_MODE, GLEAN_CHANNEL, GLEAN_DEBUG, GLEAN_ENABLED } from "../env";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { useIsServer } from "../hooks";
import { useUserData } from "../user-context";
import { handleSidebarClick } from "./sidebar-click";

export type PageProps = {
  referrer: string | undefined;
  path: string | undefined;
  subscriptionType: string;
  geo: string | undefined;
  userAgent: string | undefined;
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
  page: (arg: PageProps) => void;
  click: (arg: ElementClickedProps) => void;
};

const FIRST_PARTY_DATA_OPT_OUT_COOKIE_NAME = "moz-1st-party-data-opt-out";
const GLEAN_APP_ID = "mdn-yari";

function glean(): GleanAnalytics {
  if (typeof window === "undefined" || !GLEAN_ENABLED) {
    //SSR return noop.
    return {
      page: (page: PageProps) => {},
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
      if (page.path) {
        pageMetric.path.set(page.path);
      }
      if (page.referrer) {
        pageMetric.referrer.set(page.referrer);
      }
      if (page.geo) {
        navigatorMetric.geo.set(page.geo);
      }
      if (page.userAgent) {
        navigatorMetric.userAgent.set(page.userAgent);
      }
      navigatorMetric.subscriptionType.set(page.subscriptionType);
      pings.page.submit();
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
    handleSidebarClick(ev, gleanClick);
  });

  return gleanContext;
}

const gleanAnalytics = glean();
const GleanContext = React.createContext(gleanAnalytics);

function handleLinkClick(ev: MouseEvent, click: (source: string) => void) {
  const anchor = ev?.target as Element;
  if (anchor?.nodeName === "A") {
    if (anchor?.classList.contains("external")) {
      click(`external-link: ${anchor.getAttribute("href") || ""}`);
    }
    if (anchor?.hasAttribute?.("data-pong")) {
      click(`pong: ${anchor.getAttribute("data-pong") || ""}`);
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

export function useGleanPage() {
  const loc = useLocation();
  const userData = useUserData();
  const isServer = useIsServer();
  const path = useRef<String | null>(null);

  return useEffect(() => {
    if (!isServer && userData && path.current !== loc.pathname) {
      path.current = loc.pathname;
      gleanAnalytics.page({
        path: window?.location.toString(),
        referrer: document?.referrer,
        userAgent: navigator?.userAgent,
        geo: userData?.geo?.country,
        subscriptionType: userData?.subscriptionType || "anonymous",
      });
    }
  }, [loc.pathname, isServer, userData]);
}

export function useGleanClick() {
  const userData = useUserData();
  const glean = useGlean();
  return (source: string) =>
    glean.click({
      source,
      subscriptionType: userData?.subscriptionType || "none",
    });
}
