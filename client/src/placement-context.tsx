import React from "react";
import useSWR from "swr";
import { useUserData } from "./user-context";

interface PlacementStatus {
  contents: any[];
  click: string;
  impression: string;
}

export const PlacementContext = React.createContext<
  PlacementStatus | undefined
>(undefined);

export function PlacementProvider(props: { children: React.ReactNode }) {
  const user = useUserData();
  const { data: pong } = useSWR<PlacementStatus>(
    user?.settings?.noAds ? null : "/pong/get",
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
