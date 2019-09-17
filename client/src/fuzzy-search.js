import fuzzysearch from "fuzzysearch";

export default class FuzzySearch {
  constructor(haystack) {
    // XXX As of now, the haystack is just a list of strings. It would be
    // nice if we know some sort of "popularity" scoring for documents
    // so we can sort by that instead/additionally.
    this.haystack = haystack;
  }

  search(needle, { limit = 10 }) {
    const replChars = needle.split("").map(i => {
      return `(${escapeExp(i)})`;
    });
    const fuzzyFindExp = `(.+)?${replChars.join("(.+)?")}(.+)?$`;
    const needleLower = needle.toLowerCase();
    return this.haystack
      .filter(item => fuzzysearch(needleLower, item.toLowerCase()))
      .map(item => {
        return { needle: item, ...getSubstrings(fuzzyFindExp, item) };
      })
      .sort((a, b) => {
        if (a.score < b.score) return 1;
        if (a.score > b.score) return -1;
        return 0;
      })
      .slice(0, limit);
  }
}

const getSubstrings = (regexString, matchString) => {
  let regex = new RegExp(regexString, "gi");
  let matchArray = regex.exec(matchString);
  let substrings = [];
  let isMatch = false;
  let missingCount = 0;
  let startsWith = 0;
  for (let i = 1; i < matchArray.length; i++) {
    if (matchArray[i]) substrings.push({ str: matchArray[i], match: isMatch });
    // if undefined and not first or last, add a point because it's a match combo
    if (!matchArray[i] && i !== 1 && i !== matchArray.length - 1)
      missingCount++;
    // if first is undefined, string starts with match
    if (!matchArray[i] && i === 1) startsWith++;
    isMatch = !isMatch;
  }
  return { substrings, score: missingCount + startsWith };
};

const escapeExp = term => {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
