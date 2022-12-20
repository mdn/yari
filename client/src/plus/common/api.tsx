import { useContext, useEffect, useState } from "react";
import { searchFiltersContext } from "../contexts/search-filters";

export const NOTIFICATIONS_BASE_PATH = "/api/v1/plus/notifications";
export const WATCHED_BASE_PATH = "/api/v1/plus/watching";
export const STRIPE_PLANS_PATH = "/api/v1/stripe/plans";
export const SETTINGS_BASE_PATH = "/api/v1/plus/settings/";

export const NOTIFICATIONS_MARK_ALL_AS_READ_PATH = `${NOTIFICATIONS_BASE_PATH}/all/mark-as-read/`;
const DEFAULT_LIMIT = 20;

export type PLUS_SETTINGS = {
  col_in_search: boolean;
};

export async function toggleCollectionsInQuickSearch(enabled: boolean) {
  return await fetch(SETTINGS_BASE_PATH, {
    body: JSON.stringify({ col_in_search: enabled }),
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
  });
}

export async function markNotificationsAsRead() {
  return fetch(NOTIFICATIONS_MARK_ALL_AS_READ_PATH, {
    method: "POST",
  });
}
export const starItem = async (id: number) => {
  await post(`${NOTIFICATIONS_BASE_PATH}/${id}/toggle-starred/`);
};

export async function starItemsById(ids: number[]) {
  return await post(`${NOTIFICATIONS_BASE_PATH}/star-ids/`, {
    ids,
  });
}

export async function unstarItemsById(ids: number[]) {
  return await post(`${NOTIFICATIONS_BASE_PATH}/unstar-ids/`, {
    ids,
  });
}

export async function deleteItemsById(ids: number[]) {
  return await post(`${NOTIFICATIONS_BASE_PATH}/delete-ids/`, {
    ids,
  });
}

export async function deleteItemById(id: number) {
  return await post(`${NOTIFICATIONS_BASE_PATH}/${id}/delete/`);
}

export async function unwatchItemsByUrls(data: any[]) {
  const payload = { unwatch: data.map((val) => val.url) };
  return await post(`/api/v1/plus/unwatch-many/`, payload);
}

export async function undoDeleteItemById(id: number) {
  return await post(`${NOTIFICATIONS_BASE_PATH}/${id}/undo-deletion/`);
}

export function useNotificationsApiEndpoint(
  offset: number,
  searchTerms: string,
  selectedFilters: Record<string, string>,
  selectedSort: string,
  starred: boolean
) {
  const [data, setData] = useState<any>({});
  const [error, setError] = useState<Error | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const { getSearchFiltersParams } = useContext(searchFiltersContext);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const sp = getSearchFiltersParams();

      starred!! && sp.append("starred", "true");

      sp.append("limit", DEFAULT_LIMIT.toString());
      offset!! && sp.append("offset", offset.toString());

      const response = await fetch(
        `${NOTIFICATIONS_BASE_PATH}/?${sp.toString()}`
      );

      if (!response.ok) {
        setError(
          new Error(
            `${response.status} - There was a problem fetching your Notifications. Please try again later`
          )
        );
        setIsLoading(false);
        return;
      } else {
        let newData = await response.json();
        if (newData.items.length < DEFAULT_LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        setData({
          ...newData,
          offset,
          searchTerms,
          selectedFilters,
          selectedSort,
          starred,
        });
        setIsLoading(false);
        setError(null);
      }
    })();
  }, [
    getSearchFiltersParams,
    offset,
    searchTerms,
    selectedFilters,
    selectedSort,
    starred,
  ]);
  return { data, error, isLoading, hasMore };
}

export function useWatchedItemsApiEndpoint(
  offset: number,
  searchTerms: string,
  selectedFilters: Record<string, string>,
  selectedSort: string
) {
  const [data, setData] = useState<any>({});
  const [error, setError] = useState<Error | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const { getSearchFiltersParams } = useContext(searchFiltersContext);

  useEffect(() => {
    (async () => {
      const sp = getSearchFiltersParams();

      sp.append("limit", DEFAULT_LIMIT.toString());
      offset!! && sp.append("offset", offset.toString());
      const response = await fetch(`${WATCHED_BASE_PATH}/?${sp.toString()}`);

      if (!response.ok) {
        setError(
          new Error(
            `${response.status} - There was a problem fetching your watched items. Please try again later`
          )
        );
        setIsLoading(false);
        return;
      } else {
        let newData = await response.json();
        //We'll set an artificial id field here to make it share interface with notifications
        newData.items = newData.items.map((item) => {
          return { ...item, id: item.url };
        });
        if (newData.items.length < DEFAULT_LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        setData({
          ...newData,
          offset,
          searchTerms,
          selectedFilters,
          selectedSort,
        });
        setIsLoading(false);
        setError(null);
      }
    })();
  }, [
    getSearchFiltersParams,
    offset,
    searchTerms,
    selectedFilters,
    selectedSort,
  ]);
  return { data, error, isLoading, hasMore };
}

export async function getStripePlans() {
  let res;
  //This comes from edge lambda so must be from live.
  if (window.location.hostname.includes("localhost")) {
    res = await fetch("https://developer.allizom.org/api/v1/stripe/plans");
  } else {
    res = await fetch(STRIPE_PLANS_PATH);
  }

  return await res.json();
}

async function post(url: string, data?: object) {
  const fetchData: { method: string; headers: HeadersInit; body?: string } = {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
  };
  if (data) fetchData.body = JSON.stringify(data);

  const response = await fetch(url, fetchData);

  if (!response.ok) {
    throw new Error(`${response.status} on ${response.url}`);
  }
  return response;
}
