import fuzzysearch from "fuzzysearch";

export default class FuzzySearch {
  haystack: any;

  constructor(haystack) {
    this.haystack = haystack;
  }

  search(needle, { limit = 10 }) {
    const replChars = needle.split("").map((i) => {
      return `(${escapeExp(i)})`;
    });
    const fuzzyFindExp = `(.+)?${replChars.join("(.+)?")}(.+)?$`;
    const needleLower = needle.toLowerCase();

    const results: { index: number; substrings: any[] }[] = [];
    for (let i = 0; i < this.haystack.length && results.length < limit; i++) {
      if (fuzzysearch(needleLower, this.haystack[i].toLowerCase())) {
        results.push({
          index: i,
          substrings: getSubstrings(fuzzyFindExp, this.haystack[i]),
        });
      }
    }
    return results;
  }
}

function getSubstrings(regexString, matchString) {
  const regex = new RegExp(regexString, "gi");
  const matchArray = regex.exec(matchString) || [];
  const substrings: any[] = [];
  matchArray.forEach((str, i) => {
    if (str && i) {
      const match = !(i % 2);
      substrings.push({ str, match });
    }
  });
  return substrings;
}

function escapeExp(term) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
