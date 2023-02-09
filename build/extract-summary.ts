import * as cheerio from "cheerio";
import { ProseSection, Section } from "../libs/types/document.js";

/**
 * Given an array of sections, return a plain text
 * string of a summary. No HTML or Kumascript allowed.
 */

export function extractSummary(sections: Section[]): string {
  let summary = ""; // default and fallback is an empty string.

  function extractFirstGoodParagraph($): string {
    const seoSummary = $("span.seoSummary, .summary");
    if (seoSummary.length && seoSummary.text()) {
      return seoSummary.text();
    }
    let summary = "";
    $("p").each((i, p) => {
      // The `.each()` can only take a callback, so we need a solution
      // to exit early once we've found the first working summary.
      if (summary) return; // it already been found!
      const text = $(p).text().trim();
      // Avoid those whose paragraph is just a failing KS macro
      if (text && !text.includes("Redirect") && !text.startsWith("{{")) {
        summary = text;
      }
    });
    return summary;
  }
  // If the sections contains a "Summary" one, use that, otherwise
  // use the first prose one.
  const summarySections = sections.filter(
    (section: Section): section is ProseSection =>
      section.type === "prose" && section.value.title === "Summary"
  );
  if (summarySections.length) {
    const $ = cheerio.load(summarySections[0].value.content ?? "");
    summary = extractFirstGoodParagraph($);
  } else {
    for (const section of sections) {
      if (
        section.type !== "prose" ||
        !section.value ||
        !section.value.content
      ) {
        continue;
      }
      const $ = cheerio.load(section.value.content);
      // Remove non-p tags that we should not be looking inside.
      $("div.notecard, div.note, div.blockIndicator").remove();
      summary = extractFirstGoodParagraph($);
      if (summary) {
        break;
      }
    }
  }
  return summary;
}
