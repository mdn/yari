// The fast one
import fuzzysearch from "fuzzysearch";
// The smart one
import { match } from "fuzzyjs";
import type { MatchResult } from "fuzzyjs/dist/types";

export interface Doc {
  url: string;
  title: string;
}

type Range = {
  start: number;
  stop: number;
};

export type Substring = {
  str: string;
  match: boolean;
};

type CombinedMatchResult = Doc & MatchResult;
type Result = CombinedMatchResult & { substrings: Substring[] };

export class FuzzySearch {
  haystack: Doc[];

  constructor(haystack: Doc[]) {
    this.haystack = haystack;
  }

  search(needle: string, { limit = 10 }): Result[] {
    const needleLower = needle.toLowerCase();
    // The hands-down fastest way to see if the needle is in the URL
    // is to use `fuzzysearch()`. It's significantly faster than anything
    // from `fuzzyjs`.
    // So first filter out the "junk" by only considering those that match
    // at all.
    const candidates = this.haystack
      .filter((doc) => {
        // You could pre-compute a list of just the URLs all in lowercase,
        // but through experimentation, it's clear that this transformation
        // is sufficiently fast. And it's more memory efficient because
        // you don't need to store that second array.
        return fuzzysearch(needleLower, doc.url.toLowerCase());
      })
      // We have to cap the number of candidates because `fuzzyjs` is slow.
      // Remember that the haystack is naturally sorted by popularity
      // which gives the most populary an upper hand here.
      // The number is quite arbitrary. Through careful experimentation
      // it's found that it takes about 25ms to fully sort and filter
      // for 1,000 candidates.
      // Also, this compromise is justified in that if there that many
      // candidates to begin with the needle is bound to match too much
      // so the benefit of sorting by popularity is fair.
      .slice(0, 1000);

    // Now that we have a subset of only those that match, we can proceed
    // and use `fuzzyjs` to sort by its sorting function and extract
    // each match's ranges so we can finally result a list of sub-strings.
    const res: CombinedMatchResult[] = candidates
      .map((doc) => {
        const matched = match(needle, doc.url, {
          withScore: true,
          withRanges: true,
        });
        return Object.assign(matched, doc);
      })
      .filter((m) => m.match && m.score && m.score > 0)
      .sort((a, b) => {
        // TypeScript doesn't know what we used `withScores: true`
        // so have to do this if statement every time.
        if (b.score && a.score) {
          return b.score - a.score;
        }
        return 0;
      });
    return res.slice(0, limit).map((matchResult) => {
      return Object.assign(
        {
          substrings: matchResult.ranges
            ? getSubstringsFromRanges(matchResult.url, matchResult.ranges)
            : [],
        },
        matchResult
      ) as Result;
    });
  }
}

// Give a string an array of ranges, return something like this:
//
//  {
//     [str: "/en-US/docs/W", match: false],
//     [str: "eb", match: true],
//     [str: "/HT", match: false],
//     [str: "ML", match: true],
//  }
// ...if the string was "/en-US/docs/Web/HTML" and the fuzzy search was "ebml".
// This makes it possible to display something like:
//
//   <span>/en-US/docs/W</span>
//   <mark>eb</mark>
//   <span>/HT</span>
//   <mark>ML</mark>
//
// ...in the final rendering of the search results.
function getSubstringsFromRanges(string: string, ranges: Range[]): Substring[] {
  const substrings: Substring[] = [];
  ranges.forEach((range, i) => {
    const { start, stop } = range;
    substrings.push({ str: string.slice(start, stop), match: true });
    const nextRange = ranges[i + 1];
    if (nextRange) {
      substrings.push({
        str: string.slice(stop, nextRange.start),
        match: false,
      });
    } else {
      substrings.push({ str: string.slice(stop, string.length), match: false });
    }
  });
  return substrings;
}
