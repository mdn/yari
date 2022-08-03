import * as React from "react";
import { path, pageEvent, referrer } from "./generated/page";
import { clicked } from "./generated/event";
import * as pings from "./generated/pings";
import * as Glean from "@mozilla/glean/web";

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

const FIRST_PARTY_DATA_OPT_OUT_COOKIE_NAME = "moz-1st-party-data-opt-out";
const GLEAN_APP_ID = "mdn-yari";

function glean() {
  if (typeof window === "undefined") {
    //SSR return noop.
    return {
      page: (page: PageProps) => {},
      pageEvent: (page: PageEventProps) => {},
      event: (event: EventProps) => {},
    };
  }
  const channel = process.env.REACT_APP_GLEAN_CHANNEL || "stage";
  const debugPings = Boolean(
    JSON.parse(process.env.REACT_APP_GLEAN_DEBUG || "null")
  );
  const gleanEnabled = !Boolean(
    JSON.parse(process.env.REACT_APP_GLEAN_DISABLED || "null")
  );

  let userIsOptedOut = false;

  const value = `; ${document.cookie}`;

  const parts = value.split(`; ${FIRST_PARTY_DATA_OPT_OUT_COOKIE_NAME}=`);
  if (parts.length === 2) {
    userIsOptedOut = !!parts.pop()?.split(";").shift();
  }

  const uploadEnabled = !userIsOptedOut && gleanEnabled;

  Glean.default.initialize(GLEAN_APP_ID, uploadEnabled, {
    maxEvents: 1,
    channel,
  });

  Glean.default.setLogPings(debugPings);
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

const gleanContext = glean();
const GleanContext = React.createContext(gleanContext);

export function GleanProvider(props: { children: React.ReactNode }) {
  return (
    <GleanContext.Provider value={gleanContext}>
      {props.children}
    </GleanContext.Provider>
  );
}

export function useGlean() {
  return React.useContext(GleanContext);
}
