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
  loading = "loading",
}

export interface Fallback {
  click: string;
  view: string;
  copy: string;
  image: string;
  by: string;
}

export interface PlacementData {
  status: Status;
  click: string;
  view: string;
  copy?: string;
  image?: string;
  fallback?: Fallback;
  cta?: string;
  colors?: {
    textColor?: string;
    backgroundColor?: string;
    ctaTextColor?: string;
    ctaBackgroundColor?: string;
    textColorDark?: string;
    backgroundColorDark?: string;
    ctaTextColorDark?: string;
    ctaBackgroundColorDark?: string;
  };
}

type PlacementType = "side" | "top" | "hpMain" | "hpFooter";
export interface PlacementContextData
  extends Partial<Record<PlacementType, PlacementData>> {
  status: Status;
}

const PLACEMENT_MAP: Record<PlacementType, RegExp> = {
  side: /\/[^/]+\/(play|docs\/|blog\/|search$)/i,
  top: /\/[^/]+\/(?!$|_homepage$).*/i,
  hpMain: /\/[^/]+\/($|_homepage$)/i,
  hpFooter: /\/[^/]+\/($|_homepage$)/i,
};

function placementTypes(pathname: string): string[] {
  return Object.entries(PLACEMENT_MAP)
    .map(([k, re]) => re.test(pathname) && k)
    .filter(Boolean) as string[];
}

export const PlacementContext = React.createContext<
  PlacementContextData | null | undefined
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
  } = useSWR<PlacementContextData>(
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
        const placementResponse: PlacementContextData = await response.json();
        gleanClick(`pong: pong->status ${placementResponse.side?.status}`);
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
    <PlacementContext.Provider
      value={isLoading || isValidating ? { status: Status.loading } : pong}
    >
      {props.children}
    </PlacementContext.Provider>
  );
}

export function usePlacement() {
  return React.useContext(PlacementContext);
}
