import React, { useEffect, useRef } from "react";
import { useGleanClick } from "./telemetry/glean-context";
import useSWR from "swr";
import { PLACEMENT_ENABLED } from "./env";
import { useUserData } from "./user-context";
import { useLocation } from "react-router";
import { Payload as PlacementData } from "../../libs/pong/types";

export enum Status {
  success = "success",
  geoUnsupported = "geo_unsupported",
  capReached = "cap_reached",
  loading = "loading",
  empty = "empty",
}

type PlacementType = "side" | "top" | "hpMain" | "hpFooter" | "bottom";
export interface PlacementContextData
  extends Partial<Record<PlacementType, PlacementData>> {
  plusAvailable?: boolean;
  status: Status;
}

const PLACEMENT_MAP: Record<PlacementType, { typ: string; pattern: RegExp }> = {
  side: {
    typ: "side",
    pattern:
      /\/[^/]+\/(play|docs\/|blog\/|observatory\/?|curriculum\/[^$]|search$)/i,
  },
  top: {
    typ: "top-banner",
    pattern: /\/[^/]+\/(?!$|_homepage$).*/i,
  },
  hpMain: {
    typ: "hp-main",
    pattern: /\/[^/]+\/($|_homepage$)/i,
  },
  hpFooter: {
    typ: "hp-footer",
    pattern: /\/[^/]+\/($|_homepage$)/i,
  },
  bottom: {
    typ: "bottom-banner",
    pattern: /\/[^/]+\/docs\//i,
  },
};

function placementTypes(pathname: string): string[] {
  return Object.entries(PLACEMENT_MAP)
    .map(([k, { pattern: re }]) => re.test(pathname) && k)
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
        const {
          plusAvailable = true, // Fall back to true for seamless migration.
          ...placementResponse
        }: PlacementContextData = await response.json();
        const typs = Object.entries(PLACEMENT_MAP)
          .filter(([key]) => key in placementResponse)
          .map(([, { typ }]) => typ);
        if (typs.length) {
          gleanClick(`pong: pong->served ${typs.join()}`);
        }
        return { plusAvailable, ...placementResponse };
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
