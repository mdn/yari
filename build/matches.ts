import "mdast-util-directive";
import { fromMarkdown } from "mdast-util-from-markdown";
import { visit } from "unist-util-visit";

const ESCAPE_CHARS_RE = /[.*+?^${}()|[\]\\]/g;

type Match = { line: number; column: number };

export function findMatchesInText(
  needle: string,
  haystack: string,
  { attribute = null } = {}
): Match[] {
  // Need to remove any characters that can affect a regex if we're going
  // use the string in a manually constructed regex.
  const escaped = needle.replace(ESCAPE_CHARS_RE, "\\$&");
  const rex = attribute
    ? new RegExp(`${attribute}=['"](${escaped})['"]`, "g")
    : new RegExp(`(${escaped})`, "g");
  const matches: Match[] = [];
  for (const match of haystack.matchAll(rex)) {
    const left = haystack.slice(0, match.index);
    const line = (left.match(/\n/g) || []).length + 1;
    const lastIndexOf = left.lastIndexOf("\n") + 1;
    const column =
      match.index - lastIndexOf + 1 + (attribute ? attribute.length + 2 : 0);
    matches.push({ line, column });
  }
  return matches;
}

// find links or images in markdown content that match the given URL
export function findMatchesInMarkdown(
  url: string,
  rawContent: string,
  { type }: { type: "link" | "image" }
): Match[] {
  const matches: Match[] = [];
  const attributeType = type === "link" ? "href" : "src";
  const tree = fromMarkdown(rawContent);
  // Find all the links and images in the markdown
  // we should also find any HTML elements that contain links or images
  visit(tree, [type, "html"], (node) => {
    if (node.type === "html") {
      const matchesInHtml = findMatchesInText(url, node.value, {
        attribute: attributeType,
      });
      const correctedMatches = matchesInHtml.map(({ line, column }): Match => {
        if (line === 1) {
          // if it's the first line, we need to add the column offset
          column += node.position.start.column - 1;
        }
        line += node.position.start.line - 1;
        return { line, column };
      });
      matches.push(...correctedMatches);
    } else if (node.type == type && node.url === url) {
      // else this would be a markdown link or image
      const { line, column } = node.position.start;
      matches.push({ line, column });
    }
  });
  return matches;
}

export function getFirstMatchInText(needle, haystack): Match {
  const index = haystack.indexOf(needle);
  const left = haystack.substring(0, index);
  const line = left.split("\n").length;
  const column = left.length - left.lastIndexOf("\n");
  return { line, column };
}

export function replaceMatchingLinksInMarkdown(needle, haystack, replacement) {
  // Need to remove any characters that can affect a regex if we're going
  // use the string in a manually constructed regex.
  const escaped = needle.replace(ESCAPE_CHARS_RE, "\\$&");
  const rex = new RegExp(String.raw`\[([^\]]*)\]\((?:${escaped})\)`, "g");
  return haystack.replace(rex, (_, p1) => {
    return `[${p1}](${replacement})`;
  });
}

export function replaceMatchesInText(
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
