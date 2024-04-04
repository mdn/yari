import useSWR from "swr";
import { useSearchParams } from "react-router-dom";
import { useUserData } from "../../user-context";
import { BCD_BASE_URL } from "../../env";

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

function composeUrl({
  isAuthenticated,
  searchParams,
}: {
  isAuthenticated: boolean;
  searchParams: URLSearchParams;
}): string {
  let url = "/api/v2/updates/";
  let params = new URLSearchParams();

  for (const [key, value] of searchParams.entries()) {
    switch (key) {
      case "page":
        params.set(key, value);
        break;

      case "collections":
        if (isAuthenticated) {
          // Different endpoint for uncached personalized data.
          url += "collections/";
          params.set(key, value);
        }
        break;

      default:
        if (isAuthenticated) {
          params.set(key, value);
        }
        break;
    }
  }

  if ([...params.keys()].length) {
    url += `?${params.toString()}`;
  }

  return url;
}

export function useUpdates() {
  const user = useUserData();
  const [searchParams] = useSearchParams();

  const url = composeUrl({
    isAuthenticated: user?.isAuthenticated || false,
    searchParams,
  });

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
    `${BCD_BASE_URL}/bcd/api/v0/current/${path}.json`,
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
