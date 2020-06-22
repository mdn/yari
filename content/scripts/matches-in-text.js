function* findMatchesInText(needle, haystack, { inQuotes = false } = {}) {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let rex;
  if (inQuotes) {
    rex = new RegExp(`['"](${escaped})['"]`, "g");
  } else {
    rex = new RegExp(`(${escaped})`, "g");
  }
  for (const match of haystack.matchAll(rex)) {
    const left = haystack.slice(0, match.index);
    const line = (left.match(/\n/g) || []).length + 1;
    const lastIndexOf = left.lastIndexOf("\n") + 1;
    const column = match.index - lastIndexOf + 1;
    yield { line, column };
  }
}

module.exports = { findMatchesInText };
