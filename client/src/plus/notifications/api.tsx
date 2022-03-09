import { useEffect, useState } from "react";
import { TabVariant } from "./tabs";

export const NOTIFICATIONS_BASE_PATH = "/api/v1/plus/notifications";
export const WATCHED_BASE_PATH = "/api/v1/plus/watching";

export const NOTIFICATIONS_MARK_ALL_AS_READ_PATH = `${NOTIFICATIONS_BASE_PATH}/all/mark-as-read/`;
const NOTIFICATIONS_DEFAULT_LIMIT = 20;

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

export function useApiEndpoint(
  offset: number,
  searchTerms: string,
  selectedFilter: string,
  selectedSort: string,
  tab: TabVariant
) {
  const [data, setData] = useState<any>({});
  const [error, setError] = useState<Error | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    (async () => {
      const sp = new URLSearchParams();

      searchTerms!! && sp.append("q", searchTerms);
      selectedFilter!! && sp.append("filterType", selectedFilter);
      selectedSort!! && sp.append("sort", selectedSort);

      if (tab === TabVariant.STARRED) {
        sp.append("starred", "true");
      }

      sp.append("limit", NOTIFICATIONS_DEFAULT_LIMIT.toString());
      offset!! && sp.append("offset", offset.toString());

      const base =
        tab === TabVariant.WATCHING
          ? WATCHED_BASE_PATH
          : NOTIFICATIONS_BASE_PATH;
      const response = await fetch(`${base}/?${sp.toString()}`);

      if (!response.ok) {
        setError(
          new Error(
            `${response.status} - There was a problem fetching your data. Please try again later`
          )
        );
        setIsLoading(false);
        return;
      } else {
        let data = await response.json();
        if (tab === TabVariant.WATCHING) {
          //We'll set an artificial id field here to make it share interface with notifications
          data.items = data.items.map((item) => {
            return { ...item, id: item.url };
          });
        }
        if (data.items.length < NOTIFICATIONS_DEFAULT_LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        setData(data);
        setIsLoading(false);
        setError(null);
      }
    })();
  }, [offset, searchTerms, tab, selectedFilter, selectedSort]);
  return { data, error, isLoading, hasMore };
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
  return true;
}
