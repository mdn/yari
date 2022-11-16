import { useEffect, useState } from "react";
import { Doc, DocParent } from "../../../../libs/types/document";
import { FrequentlyViewedItem, ItemParent } from "./api";

export interface FrequentlyViewedCollection {
  name: string;
  article_count: number;
  created_at: string;
  updated_at: string;
  description: string;
  items: FrequentlyViewedItem[];
}

export type FrequentlyViewedEntry = {
  parents?: ItemParent[];
  serial: number;
  //This timestamp is deprecated and should be removed
  timestamp?: number;
  timestamps: number[];
  title: string;
  url: string;
  visitCount: number;
};

export const FREQUENTLY_VIEWED_STORAGE_KEY = "frequently-viewed-documents";

const ThirtyDaysMilliseconds = 30 * 24 * 60 * 60 * 1000;
const isWithinLastThirtyDays = (date: Date): boolean => {
  const currentDate = Date.now();
  return date.getTime() >= currentDate - ThirtyDaysMilliseconds;
};

function getFrequentlyViewed(): FrequentlyViewedEntry[] {
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

  // Migrate old entries just once. Log their most recent timestamp 'visitCount' times. (If within last 30 days)
  entries.forEach((val) => {
    if (!val.timestamps) {
      val.timestamps = [];
      if (val.timestamp) {
        if (isWithinLastThirtyDays(new Date(val.timestamp))) {
          for (let i = 0; i < val.visitCount; i++) {
            val.timestamps.push(val.timestamp);
          }
          //Delete old timestamp
          val.timestamp = undefined;
        }
      }
    }
  });

  // Assign serials to old entries.
  entries.forEach((e) => {
    e.serial =
      e.serial === undefined
        ? getNextFrequentlyViewedSerial(entries)
        : e.serial;
  });
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

const sortByTimestampThenVistsDesc = (
  first: FrequentlyViewedEntry,
  second: FrequentlyViewedEntry
) => {
  //'Each timestamp represents one visit. The first is the most recent visit.
  if (first.timestamps[0] < second.timestamps[0]) return 1;
  if (first.timestamps[0] > second.timestamps[0]) return -1;
  if (first.timestamps.length > second.timestamps.length) return -1;
  if (first.timestamps.length < second.timestamps.length) return 1;
  return 0;
};

function getNextFrequentlyViewedSerial(
  entries: FrequentlyViewedEntry[]
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
    created_at: new Date().toISOString(),
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
      .sort(sortByTimestampThenVistsDesc)
      .slice(0, limit + offset)
      .map((val) => {
        const lastModified = val.timestamps[0]
          ? new Date(freqViewed[0].timestamps[0]).toISOString()
          : new Date().toISOString();
        return {
          created_at: lastModified,
          updated_at: lastModified,
          parents: val.parents || [],
          title: val.title,
          url: val.url,
          id: val.serial,
        };
      });

    setCollection({
      ...collection,
      article_count: freqViewed.length,
      created_at: freqViewed[0]
        ? new Date(freqViewed[0].timestamps[0]).toISOString()
        : new Date().toISOString(),
      items: paged,
      updated_at: freqViewed[0]
        ? new Date(freqViewed[0].timestamps[0]).toISOString()
        : new Date().toISOString(),
    });
  }, [limit, setEnd, offset]);

  return collection;
}

/**
 * @param  {Doc|undefined} doc
 * Persists frequently viewed docs to localstorage as part of MDN Plus MVP.
 *
 */
export function useIncrementFrequentlyViewed(doc: Doc | undefined) {
  useEffect(() => {
    if (!doc) {
      return;
    }

    let frequentlyViewed = getFrequentlyViewed();

    const index = frequentlyViewed.findIndex(
      (entry) => entry.url === doc.mdn_url
    );

    if (index !== -1) {
      frequentlyViewed[index].timestamps.unshift(new Date().getTime());
    } else {
      const newEntry: FrequentlyViewedEntry = {
        serial: getNextFrequentlyViewedSerial(frequentlyViewed),
        url: doc.mdn_url,
        title: doc.title,
        parents: doc.parents,
        visitCount: 1,
        timestamps: [new Date().getTime()],
      };

      if (frequentlyViewed.length === 0) {
        setFrequentlyViewed([newEntry]);
        return;
      } else {
        frequentlyViewed.unshift(newEntry);
      }
    }
    //Sort descending so most frequently viewed appears on top.
    frequentlyViewed = frequentlyViewed.sort(sortByTimestampThenVistsDesc);
    setFrequentlyViewed(frequentlyViewed);
  });
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
