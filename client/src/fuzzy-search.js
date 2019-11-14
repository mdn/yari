import fuzzysearch from "fuzzysearch";

export default class FuzzySearch {
  constructor(haystack) {
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
      .slice(0, limit)
      .map(item => {
        return { needle: item, ...getSubstrings(fuzzyFindExp, item) };
      });
  }
}

const getSubstrings = (regexString, matchString) => {
  let regex = new RegExp(regexString, "gi");
  let matchArray = regex.exec(matchString);
  let substrings = [];
  let isMatch = false;
  for (let i = 1; i < matchArray.length; i++) {
    if (matchArray[i]) substrings.push({ str: matchArray[i], match: isMatch });
    isMatch = !isMatch;
  }
  return { substrings };
};

const escapeExp = term => {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
