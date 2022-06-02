const ESCAPE_CHARS_RE = /[.*+?^${}()|[\]\\]/g;

function* findMatchesInText(needle, haystack, { attribute = null } = {}) {
  // Need to remove any characters that can affect a regex if we're going
  // use the string in a manually constructed regex.
  const escaped = needle.replace(ESCAPE_CHARS_RE, "\\$&");
  let rex;
  if (attribute) {
    rex = new RegExp(`${attribute}=['"](${escaped})['"]`, "g");
  } else {
    rex = new RegExp(`(${escaped})`, "g");
  }
  for (const match of haystack.matchAll(rex)) {
    const left = haystack.slice(0, match.index);
    const line = (left.match(/\n/g) || []).length + 1;
    const lastIndexOf = left.lastIndexOf("\n") + 1;
    const column =
      match.index - lastIndexOf + 1 + (attribute ? attribute.length + 2 : 0);
    yield { line, column };
  }
}

function getFirstMatchInText(needle, haystack) {
  const index = haystack.indexOf(needle);
  const left = haystack.substring(0, index);
  const line = left.split("\n").length;
  const column = left.length - left.lastIndexOf("\n");
  return { line, column };
}

function replaceMatchingLinksInMarkdown(needle, haystack, replacement) {
  // Need to remove any characters that can affect a regex if we're going
  // use the string in a manually constructed regex.
  const escaped = needle.replace(ESCAPE_CHARS_RE, "\\$&");
  const rex = new RegExp(String.raw`\[([^\]]*)\]\((?:${escaped})\)`, "g");
  return haystack.replace(rex, (_, p1) => {
    return `[${p1}](${replacement})`;
  });
}

function replaceMatchesInText(
  needle,
  haystack,
  replacement,
  { inAttribute = null, removeEntireAttribute = false }
) {
  // Need to remove any characters that can affect a regex if we're going
  // use the string in a manually constructed regex.
  const escaped = needle.replace(ESCAPE_CHARS_RE, "\\$&");
  let rex;
  if (inAttribute) {
    rex = new RegExp(`\\s*${inAttribute}=['"](${escaped})['"]`, "g");
  } else {
    rex = new RegExp(`(${escaped})`, "g");
  }
  return haystack.replace(rex, (match, p1) => {
    if (removeEntireAttribute) {
      return "";
    }
    return match.replace(p1, replacement);
  });
}

module.exports = {
  findMatchesInText,
  getFirstMatchInText,
  replaceMatchesInText,
  replaceMatchingLinksInMarkdown,
};
