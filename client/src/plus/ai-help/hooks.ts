import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

export function useDelayedArray<T>(
  value: T[] | undefined,
  minDelay: number,
  randomDelay: number = 0
): T[] | undefined {
  const [delayedArray, setValue] = useState<T[]>();
  const last = useRef<T[]>();

  useEffect(() => {
    const current = value;

    if (!current || current?.length === last.current?.length) {
      return;
    }

    last.current = current;

    let delay = 0;

    const timers = current.map((_, index) => {
      const handler = () => setValue(current.slice(0, index));
      delay += minDelay + randomDelay * Math.random();
      return window.setTimeout(handler, delay);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      setValue(current);
    };
  }, [value, minDelay, randomDelay, setValue]);

  return delayedArray;
}

export function useHistorySearchQuery(query: string | undefined) {
  const { pathname, search } = useLocation();
  const lastQuery = useRef<string>();

  useEffect(() => {
    if (!query || query === lastQuery.current) {
      return;
    }

    lastQuery.current = query;
    if (search !== query) {
      window.history.replaceState({ search: query }, "", `${pathname}${query}`);
    }
  }, [query, pathname, search]);
}
