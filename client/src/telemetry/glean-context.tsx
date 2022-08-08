import * as React from "react";
import { path, pageEvent, referrer } from "./generated/page";
import { clicked } from "./generated/event";
import * as pings from "./generated/pings";
import * as Glean from "@mozilla/glean/web";
import { GLEAN_CHANNEL, GLEAN_DEBUG, GLEAN_DISABLED } from "../env";

export type PageProps = {
  referrer: string | undefined;
  path: string | undefined;
};

export type PageEventProps = {
  referrer: string | undefined;
  path: string | undefined;
};

export type EventProps = {
  label: string;
  position: string;
  type: string;
};

export type GleanAnalytics = {
  page: (arg: PageProps) => void;
  pageEvent: (arg: PageEventProps) => void;
  event: (arg: EventProps) => void;
};

const FIRST_PARTY_DATA_OPT_OUT_COOKIE_NAME = "moz-1st-party-data-opt-out";
const GLEAN_APP_ID = "mdn-yari";

function glean(): GleanAnalytics {
  if (typeof window === "undefined") {
    //SSR return noop.
    return {
      page: (page: PageProps) => {},
      pageEvent: (page: PageEventProps) => {},
      event: (event: EventProps) => {},
    };
  }

  const cookies = `; ${document.cookie};`;
  const userIsOptedOut = cookies.includes(
    `; ${FIRST_PARTY_DATA_OPT_OUT_COOKIE_NAME}=1;`
  );

  const uploadEnabled = !userIsOptedOut && !GLEAN_DISABLED;

  Glean.default.initialize(GLEAN_APP_ID, uploadEnabled, {
    maxEvents: 1,
    channel: GLEAN_CHANNEL,
  });

  Glean.default.setLogPings(GLEAN_DEBUG);
  Glean.default.setDebugViewTag("mdn-dev");
  Glean.default.setUploadEnabled(uploadEnabled);

  let gleanContext = {
    page: (page: PageProps) => {
      if (page.path) {
        path.set(page.path);
      }

      if (page.referrer) {
        referrer.set(page.referrer);
      }
      pings.page.submit();
    },
    pageEvent: (page: PageEventProps) => {
      if (page.path) {
        pageEvent.record();
      }

      if (page.referrer) {
        referrer.set(page.referrer);
      }
      pings.page.submit();
    },
    event: (event: EventProps) => {
      const { label, position, type } = event;
      clicked.record({
        label,
        position,
        type,
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
