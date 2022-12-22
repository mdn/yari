import useSWR from "swr";
import { useSearchParams } from "react-router-dom";
import { useUserData } from "../../user-context";

export interface Event {
  path: string;
  compat: {
    mdn_url?: string;
    source_file: string;
    spec_url?: string[];
    status: {
      deprecated: boolean;
      experimental: boolean;
      standard_track: boolean;
    };
    engines: string[];
  };
}

export interface Group {
  browser: string;
  version: string;
  release_date: string;
  engine: string;
  engine_version: string;
  release_notes: string[];
  status: string;
  name: string;
  events: {
    added: Event[];
    removed: Event[];
  };
}

interface Page {
  data: Group[];
  last: number;
}

export function useUpdates() {
  const user = useUserData();
  const [searchParams] = useSearchParams();

  if (!user?.isAuthenticated) {
    for (const key of searchParams.keys()) {
      if (key !== "page") {
        searchParams.delete(key);
      }
    }
  }

  let url = `/api/v2/updates/`;

  if (searchParams.get("show") === "watched") {
    url += "watched/";
    searchParams.delete("show");
  }

  const search = searchParams.toString();
  if (search) {
    url += `?${search}`;
  }

  return useSWR(
    url,
    async (key) => {
      const res = await fetch(key);
      if (res.ok) {
        return (await res.json()) as Page;
      }
      if (res.status === 404) {
        return;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  );
}

export function useBCD(path: string) {
  return useSWR(
    `/bcd/api/v0/current/${path}.json`,
    async (key) => {
      const res = await fetch(key);
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 404) {
        return;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  );
}
