import * as React from "react";
import { path, referrer } from "./generated/pageView";
import { clicked } from "./generated/element";
import * as pings from "./generated/pings";
import * as Glean from "@mozilla/glean/web";
import { GLEAN_CHANNEL, GLEAN_DEBUG, GLEAN_ENABLED } from "../env";

export type PageProps = {
  referrer: string | undefined;
  path: string | undefined;
};

export type PageEventProps = {
  referrer: string | undefined;
  path: string | undefined;
};

export type ElementClickedProps = {
  source: string;
  subscription_type: string;
};

export type GleanAnalytics = {
  page: (arg: PageProps) => void;
  click: (arg: ElementClickedProps) => void;
};

const FIRST_PARTY_DATA_OPT_OUT_COOKIE_NAME = "moz-1st-party-data-opt-out";
const GLEAN_APP_ID = "mdn-yari";

function glean(): GleanAnalytics {
  if (typeof window === "undefined") {
    //SSR return noop.
    return {
      page: (page: PageProps) => {},
      click: (element: ElementClickedProps) => {},
    };
  }

  const cookies = `; ${document.cookie};`;
  const userIsOptedOut = cookies.includes(
    `; ${FIRST_PARTY_DATA_OPT_OUT_COOKIE_NAME}=true;`
  );

  const uploadEnabled = !userIsOptedOut && GLEAN_ENABLED;

  Glean.default.initialize(GLEAN_APP_ID, uploadEnabled, {
    maxEvents: 1,
    channel: GLEAN_CHANNEL,
  });

  Glean.default.setLogPings(GLEAN_DEBUG);
  Glean.default.setDebugViewTag("mdn-dev");
  Glean.default.setUploadEnabled(uploadEnabled);

  const gleanContext = {
    page: (page: PageProps) => {
      if (page.path) {
        path.set(page.path);
      }

      if (page.referrer) {
        referrer.set(page.referrer);
      }
      pings.page.submit();
    },
    click: (event: ElementClickedProps) => {
      const { source, subscription_type } = event;
      clicked.record({
        source,
        subscription_type,
      });
      pings.action.submit();
    },
  };
  return gleanContext;
}

const gleanAnalytics = glean();
const GleanContext = React.createContext(gleanAnalytics);

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
