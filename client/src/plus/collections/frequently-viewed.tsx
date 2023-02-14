import { useEffect, useState } from "react";
import { Doc } from "../../../../libs/types/document";
import { useUserData } from "../../user-context";
import { FrequentlyViewedItem, ItemParent } from "./api";

export interface FrequentlyViewedCollection {
  name: string;
  article_count: number;
  updated_at: string;
  description: string;
  items: FrequentlyViewedItem[];
}

export type FrequentlyViewedEntry = {
  parents?: ItemParent[];
  serial: number;
  timestamps: number[];
  title: string;
  url: string;
};

export type OldFrequentlyViewedEntry = {
  parents?: ItemParent[];
  serial: number;
  timestamp: number;
  title: string;
  url: string;
  visitCount: number;
};

export const FREQUENTLY_VIEWED_STORAGE_KEY = "frequently-viewed-documents-v2";
export const FREQUENTLY_VIEWED_STORAGE_KEY_OLD = "frequently-viewed-documents";

const ThirtyDaysMilliseconds = 30 * 24 * 60 * 60 * 1000;
const isWithinLastThirtyDays = (date: Date): boolean => {
  const currentDate = Date.now();
  return date.getTime() >= currentDate - ThirtyDaysMilliseconds;
};

function getFrequentlyViewed(): FrequentlyViewedEntry[] {
  migrateOld();
  let frequentlyViewed: string | null = null;
  try {
    frequentlyViewed = localStorage.getItem(FREQUENTLY_VIEWED_STORAGE_KEY);
  } catch (err) {
    console.warn(
      "Unable to read frequently viewed documents from localStorage",
      err
    );
  }

  const entries = JSON.parse(
    frequentlyViewed || "[]"
  ) as FrequentlyViewedEntry[];

  //Remove all timestamps older than 30 days and any pages with no more hits.
  return filterFrequentlyViewed(entries);
}

function setFrequentlyViewed(frequentlyViewed: FrequentlyViewedEntry[]) {
  try {
    localStorage.setItem(
      FREQUENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify(frequentlyViewed)
    );
  } catch (err) {
    console.warn(
      "Failed to write frequently viewed documents to localStorage",
      err
    );
  }
}

const sortByVisitsThenTimestampsDesc = (
  first: FrequentlyViewedEntry,
  second: FrequentlyViewedEntry
) => {
  //'Each timestamp represents one visit. The first is the most recent visit.
  if (first.timestamps.length > second.timestamps.length) return -1;
  if (first.timestamps.length < second.timestamps.length) return 1;
  if (first.timestamps[0] < second.timestamps[0]) return 1;
  if (first.timestamps[0] > second.timestamps[0]) return -1;
  return 0;
};

function getNextFrequentlyViewedSerial(
  entries: OldFrequentlyViewedEntry[] | FrequentlyViewedEntry[]
): number {
  return (
    1 +
    Math.max(
      0,
      ...entries.map((entry) => entry.serial).filter((serial) => !isNaN(serial))
    )
  );
}

export function useFrequentlyViewed(
  limit: number = 0,
  offset: number = 10,
  setEnd?: (bool) => void
): FrequentlyViewedCollection {
  const [collection, setCollection] = useState<FrequentlyViewedCollection>({
    article_count: 0,
    description: "Articles you viewed more than 2 times in the past 30 days.",
    items: [],
    name: "Frequently Viewed Articles",
    updated_at: new Date().toISOString(),
  });

  useEffect(() => {
    let freqViewed = getFrequentlyViewed();
    freqViewed = freqViewed.filter((val) => val.timestamps.length >= 2);
    if (limit + offset > freqViewed.length) {
      setEnd && setEnd(true);
    }
    let paged: FrequentlyViewedItem[] = freqViewed
      .slice(0, limit + offset)
      .map((val) => {
        return {
          parents: val.parents || [],
          title: val.title,
          url: val.url,
          id: val.serial,
        };
      });

    setCollection((c) => {
      return {
        ...c,
        article_count: freqViewed.length,
        items: paged,
        updated_at: freqViewed[0]
          ? new Date(freqViewed[0].timestamps[0]).toISOString()
          : new Date().toISOString(),
      };
    });
  }, [limit, setEnd, offset]);

  return collection;
}

function migrateOld() {
  let frequentlyViewed: string | null = null;
  try {
    frequentlyViewed = localStorage.getItem(FREQUENTLY_VIEWED_STORAGE_KEY_OLD);
  } catch (err) {
    console.warn(
      "Unable to read frequently viewed documents from localStorage",
      err
    );
    return;
  }

  const entries = JSON.parse(
    frequentlyViewed || "[]"
  ) as OldFrequentlyViewedEntry[];

  if (entries.length === 0) {
    return;
  }

  const newEntries: FrequentlyViewedEntry[] = [];

  // Migrate old entries. Log their most recent timestamp 'visitCount' times. (If within last 30 days)
  entries.forEach((val) => {
    if (isWithinLastThirtyDays(new Date(val.timestamp))) {
      let timestamps: number[] = [];
      for (let i = 0; i < val.visitCount; i++) {
        timestamps.push(val.timestamp);
      }

      let newEntry: FrequentlyViewedEntry = {
        serial:
          val.serial === undefined
            ? getNextFrequentlyViewedSerial(entries)
            : val.serial,
        timestamps,
        title: val.title,
        url: val.url,
        parents: val.parents,
      };
      newEntries.push(newEntry);
    }
  });
  newEntries.sort(sortByVisitsThenTimestampsDesc);
  setFrequentlyViewed(newEntries);
  try {
    localStorage.removeItem(FREQUENTLY_VIEWED_STORAGE_KEY_OLD);
  } catch (e) {
    console.warn("Unable to remove old frequently viewed from localStorage");
    return;
  }
}

/**
 * @param  {Doc|undefined} doc
 * Persists frequently viewed docs to localstorage as part of MDN Plus MVP.
 *
 */
export function useIncrementFrequentlyViewed(doc: Doc | undefined) {
  const user = useUserData();

  useEffect(() => {
    if (!doc || !user?.isAuthenticated) {
      return;
    }

    let frequentlyViewed = getFrequentlyViewed();

    const index = frequentlyViewed.findIndex(
      (entry) => entry.url === doc.mdn_url
    );

    if (index !== -1) {
      frequentlyViewed[index].timestamps.unshift(Date.now());
    } else {
      const newEntry: FrequentlyViewedEntry = {
        serial: getNextFrequentlyViewedSerial(frequentlyViewed),
        url: doc.mdn_url,
        title: doc.title,
        parents: doc.parents,
        timestamps: [Date.now()],
      };

      if (frequentlyViewed.length === 0) {
        setFrequentlyViewed([newEntry]);
        return;
      } else {
        frequentlyViewed.unshift(newEntry);
      }
    }
    //Sort descending so most frequently viewed appears on top.
    frequentlyViewed = frequentlyViewed.sort(sortByVisitsThenTimestampsDesc);
    setFrequentlyViewed(frequentlyViewed);
  }, [user?.isAuthenticated, doc]);
}

const filterFrequentlyViewed = (frequentlyViewed) => {
  //1. Remove timestamps older than 30 days.
  //2. Filter all values with no remaining timestamps
  return frequentlyViewed
    .map((fv) => {
      return {
        ...fv,
        timestamps: fv.timestamps.filter((ts) =>
          isWithinLastThirtyDays(new Date(ts))
        ),
      };
    })
    .filter((fv) => fv.timestamps.length > 0);
};
