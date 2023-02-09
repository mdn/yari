import React from "react";
import useSWR from "swr";
import { PLACEMENT_ENABLED } from "./env";
import { useUserData } from "./user-context";

interface Fallback {
  copy: string;
  click: string;
  view: string;
  image: string;
  by: string;
}

interface PlacementStatus {
  copy: string;
  click: string;
  view: string;
  fallback?: Fallback;
  image: string;
}

export const PlacementContext = React.createContext<
  PlacementStatus | undefined
>(undefined);

export function PlacementProvider(props: { children: React.ReactNode }) {
  const user = useUserData();
  const { data: pong } = useSWR<PlacementStatus>(
    !PLACEMENT_ENABLED || user?.settings?.noAds ? null : "/pong/get",
    async (url) => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keywords: [] }),
      });

      if (!response.ok) {
        throw Error(response.statusText);
      }

      return (await response.json()) as PlacementStatus;
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  return (
    <PlacementContext.Provider value={pong}>
      {props.children}
    </PlacementContext.Provider>
  );
}

export function usePlacementStatus() {
  return React.useContext(PlacementContext);
}
