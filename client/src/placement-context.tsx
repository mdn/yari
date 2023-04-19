import React, { useEffect, useRef } from "react";
import { useGleanClick } from "./telemetry/glean-context";
import useSWR from "swr";
import { PLACEMENT_ENABLED } from "./env";
import { useUserData } from "./user-context";
import { useLocation } from "react-router";

export enum Status {
  success = "success",
  geoUnsupported = "geo_unsupported",
  capReached = "cap_reached",
}

export interface Fallback {
  click: string;
  view: string;
  copy: string;
  image: string;
  by: string;
}

export interface PlacementError {
  status: Status.geoUnsupported | Status.capReached;
}

export interface PlacementStatus {
  status: Status.success;
  click: string;
  view: string;
  copy?: string;
  image?: string;
  fallback?: Fallback;
}

export interface TopBannerPlacementData {
  status: Status.success;
  click: string;
  view: string;
  copy: string;
  image: string;
  cta: string;
  colors?: {
    color?: string;
    background?: string;
    ctaColor?: string;
    ctaBackground?: string;
  };
}

export interface PlacementData {
  banner: PlacementStatus | PlacementError;
  topBanner: TopBannerPlacementData | PlacementError;
}

const BANNER_PLACEMENT_TUPLE: [string, RegExp] = [
  "banner",
  /\/[^/]+\/(docs\/|search$|_homepage)/i,
];
const TOP_BANNER_PLACEMENT_PATH_RE: [string, RegExp] = ["topBanner", /.*/i];
const PLACEMENT_MAP: [string, RegExp][] = [
  BANNER_PLACEMENT_TUPLE,
  TOP_BANNER_PLACEMENT_PATH_RE,
];

function placementTypes(pathname: string): string[] {
  return PLACEMENT_MAP.map(([k, re]) => re.test(pathname) && k).filter(
    Boolean
  ) as string[];
}

export const PlacementContext = React.createContext<
  PlacementData | null | undefined
>(undefined);

export function PlacementProvider(props: { children: React.ReactNode }) {
  const user = useUserData();
  const location = useLocation();
  const gleanClick = useGleanClick();
  const pathname = useRef(location.pathname);
  const {
    data: pong,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<PlacementData>(
    !PLACEMENT_ENABLED ||
      user?.settings?.noAds ||
      !placementTypes(location.pathname)
      ? null
      : "/pong/get",
    async (url) => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: [],
          pongs: placementTypes(location.pathname),
        }),
      });

      gleanClick(`pong: pong->fetched ${response.status}`);

      if (!response.ok) {
        throw Error(response.statusText);
      }

      try {
        const placementResponse: PlacementData = await response.json();
        gleanClick(`pong: pong->status ${placementResponse.banner.status}`);
        return placementResponse;
      } catch (e) {
        throw Error(response.statusText);
      }
    },
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    if (location.pathname !== pathname.current) {
      mutate();
      pathname.current = location.pathname;
    }
  }, [location.pathname, mutate]);

  return (
    <PlacementContext.Provider value={isLoading || isValidating ? null : pong}>
      {props.children}
    </PlacementContext.Provider>
  );
}

export function usePlacement() {
  return React.useContext(PlacementContext);
}
