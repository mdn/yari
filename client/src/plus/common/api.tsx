import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const NOTIFICATIONS_BASE_PATH = "/api/v1/plus/notifications";
export const WATCHED_BASE_PATH = "/api/v1/plus/watching";
export const STRIPE_PLANS_PATH = "/api/v1/stripe/plans";
export const SETTINGS_BASE_PATH = "/api/v1/plus/settings/";
export const NEWSLETTER_BASE_PATH = "/api/v1/plus/newsletter/";

export const NOTIFICATIONS_MARK_ALL_AS_READ_PATH = `${NOTIFICATIONS_BASE_PATH}/all/mark-as-read/`;
const DEFAULT_LIMIT = 20;

export type PLUS_SETTINGS = {
  col_in_search: boolean;
};

export async function toggleNewsletterSubscription(
  subscribed: boolean
): Promise<boolean | null> {
  try {
    const res = await fetch(NEWSLETTER_BASE_PATH, {
      method: subscribed ? "POST" : "DELETE",
      headers: {
        "content-type": "application/json",
      },
    });
    const { subscribed: subscribedUpdated } = await res.json();
    return subscribedUpdated;
  } catch {
    return null;
  }
}

export async function getNewsletterSubscription(): Promise<boolean | null> {
  try {
    const res = await fetch(NEWSLETTER_BASE_PATH);
    const { subscribed } = await res.json();
    return subscribed;
  } catch {
    return null;
  }
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

export function useNotificationsApiEndpoint(offset: number, starred: boolean) {
  const [data, setData] = useState<any>({});
  const [error, setError] = useState<Error | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const sp = new URLSearchParams(searchParams);

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
          starred,
        });
        setIsLoading(false);
        setError(null);
      }
    })();
  }, [searchParams, offset, starred]);
  return { data, error, isLoading, hasMore };
}

export function useWatchedItemsApiEndpoint(offset: number) {
  const [data, setData] = useState<any>({});
  const [error, setError] = useState<Error | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    (async () => {
      const sp = new URLSearchParams(searchParams);

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
        });
        setIsLoading(false);
        setError(null);
      }
    })();
  }, [searchParams, offset]);
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
