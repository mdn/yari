import { useEffect, useState } from "react";
import { useFrequentlyViewed } from "../../document/hooks";
import { BookmarkData } from "../collections";

export const NOTIFICATIONS_BASE_PATH = "/api/v1/plus/notifications";
export const WATCHED_BASE_PATH = "/api/v1/plus/watching";
export const COLLECTION_BASE_PATH = "/api/v1/plus/collection";
export const STRIPE_PLANS_PATH = "/api/v1/stripe/plans";

export const NOTIFICATIONS_MARK_ALL_AS_READ_PATH = `${NOTIFICATIONS_BASE_PATH}/all/mark-as-read/`;
const DEFAULT_LIMIT = 20;

export async function markNotificationsAsRead(body: FormData) {
  return fetch(NOTIFICATIONS_MARK_ALL_AS_READ_PATH, {
    body: body,
    method: "POST",
  });
}
export const starItem = async (csrfToken: string, id: number) => {
  await post(`${NOTIFICATIONS_BASE_PATH}/${id}/toggle-starred/`, csrfToken);
};

export async function starItemsById(csrfToken: string, ids: number[]) {
  return await post(`${NOTIFICATIONS_BASE_PATH}/star-ids/`, csrfToken, {
    ids,
  });
}

export async function unstarItemsById(csrfToken: string, ids: number[]) {
  return await post(`${NOTIFICATIONS_BASE_PATH}/unstar-ids/`, csrfToken, {
    ids,
  });
}

export async function deleteItemsById(csrfToken: string, ids: number[]) {
  return await post(`${NOTIFICATIONS_BASE_PATH}/delete-ids/`, csrfToken, {
    ids,
  });
}

export async function deleteItemById(csrfToken: string, id: number) {
  return await post(`${NOTIFICATIONS_BASE_PATH}/${id}/delete/`, csrfToken);
}

export async function unwatchItemsByUrls(csrfToken: string, data: any[]) {
  const payload = { unwatch: data.map((val) => val.url) };
  return await post(`/api/v1/plus/unwatch-many/`, csrfToken, payload);
}

export async function undoDeleteItemById(csrfToken: string, id: number) {
  return await post(
    `${NOTIFICATIONS_BASE_PATH}/${id}/undo-deletion/`,
    csrfToken
  );
}

export function useNotificationsApiEndpoint(
  offset: number,
  searchTerms: string,
  selectedFilter: string,
  selectedSort: string,
  starred: boolean
) {
  const [data, setData] = useState<any>({});
  const [error, setError] = useState<Error | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const sp = new URLSearchParams();

      searchTerms!! && sp.append("q", searchTerms);
      selectedFilter!! && sp.append("filterType", selectedFilter);
      selectedSort!! && sp.append("sort", selectedSort);
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
        let data = await response.json();
        if (data.items.length < DEFAULT_LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        setData(data);
        setIsLoading(false);
        setError(null);
      }
    })();
  }, [offset, searchTerms, selectedFilter, selectedSort, starred]);
  return { data, error, isLoading, hasMore };
}

export function useWatchedItemsApiEndpoint(
  offset: number,
  searchTerms: string,
  selectedFilter: string,
  selectedSort: string
) {
  const [data, setData] = useState<any>({});
  const [error, setError] = useState<Error | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    (async () => {
      const sp = new URLSearchParams();

      searchTerms!! && sp.append("q", searchTerms);
      selectedFilter!! && sp.append("filterType", selectedFilter);
      selectedSort!! && sp.append("sort", selectedSort);

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
        let data = await response.json();
        //We'll set an artificial id field here to make it share interface with notifications
        data.items = data.items.map((item) => {
          return { ...item, id: item.url };
        });
        if (data.items.length < DEFAULT_LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        setData(data);
        setIsLoading(false);
        setError(null);
      }
    })();
  }, [offset, searchTerms, selectedFilter, selectedSort]);
  return { data, error, isLoading, hasMore };
}

export async function updateCollectionItem(
  item: BookmarkData,
  formData: URLSearchParams,
  csrftoken: string
) {
  const res = await fetch(`${COLLECTION_BASE_PATH}/?url=${item.url}`, {
    method: "POST",
    body: new URLSearchParams([...(formData as any)]),
    headers: {
      "X-CSRFToken": csrftoken,
    },
  });

  return res;
}

export async function updateDeleteCollectionItem(
  item: BookmarkData,
  csrftoken: string,
  shouldDelete: Boolean
) {
  const formData = new FormData();
  formData.append("delete", shouldDelete.toString());
  const res = await fetch(`${COLLECTION_BASE_PATH}/?url=${item.url}`, {
    method: "POST",
    body: formData,
    headers: {
      "X-CSRFToken": csrftoken,
    },
  });
  return res;
}

export function useCollectionsApiEndpoint(
  offset: number,
  searchTerms: string,
  selectedFilter: string,
  selectedSort: string
) {
  const [data, setData] = useState<any>({});
  const [error, setError] = useState<Error | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    (async () => {
      const sp = new URLSearchParams();

      searchTerms!! && sp.append("q", searchTerms);
      selectedFilter!! && sp.append("filterType", selectedFilter);
      selectedSort!! && sp.append("sort", selectedSort);
      sp.append("limit", DEFAULT_LIMIT.toString());
      offset!! && sp.append("offset", offset.toString());
      const response = await fetch(`${COLLECTION_BASE_PATH}/?${sp.toString()}`);

      if (!response.ok) {
        setError(
          new Error(
            `${response.status} - There was a problem fetching your Collection. Please try again later`
          )
        );
        setIsLoading(false);
        setHasMore(false);
        return;
      } else {
        let data = await response.json();
        if (data.items.length < DEFAULT_LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        setData(data);
        setIsLoading(false);
        setError(null);
      }
    })();
  }, [offset, searchTerms, selectedFilter, selectedSort]);

  return { data, error, isLoading, hasMore };
}

export function useFrequentlyViewedData(searchTerms: string) {
  let [entries, setFrequentlyViewed] = useFrequentlyViewed();
  const [data, setData] = useState(entries);
  useEffect(() => {
    if (searchTerms) {
      const lowerSearchTerms = searchTerms.toLowerCase();
      const filteredEntries = entries.filter((val) =>
        val.title.toLowerCase().includes(lowerSearchTerms)
      );
      setData(filteredEntries);
    } else {
      setData(entries);
    }
  }, [searchTerms, entries]);
  return { data, setFrequentlyViewed };
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

async function post(url: string, csrfToken: string, data?: object) {
  const fetchData: { method: string; headers: HeadersInit; body?: string } = {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken,
      "content-type": "text/plain",
    },
  };
  if (data) fetchData.body = JSON.stringify(data);

  const response = await fetch(url, fetchData);

  if (!response.ok) {
    throw new Error(`${response.status} on ${response.url}`);
  }
  return response;
}
