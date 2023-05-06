import * as cheerio from "cheerio";
import { Doc } from "../libs/types/document.js";

/** Extract and mutate the $ if it as a "Quick_links" section.
 * But only if it exists.
 *
 * If you had this:
 *
 *   const $ = cheerio.load(`
 *      <div id="Quick_links">Stuff</div>
 *      <h2>Headline<h2>
 *      <p>Text</p>
 *    `)
 *   const sidebar = extractSidebar($);
 *   console.log(sidebar);
 *   // '<div id="Quick_links">Stuff</div>'
 *   console.log($.html());
 *   // '<h2>Headline<h2>\n<p>Text</p>'
 *
 * ...give or take some whitespace.
 */

export function extractSidebar($: cheerio.CheerioAPI, doc: Partial<Doc>) {
  const search = $("#Quick_links");

  if (!search.length) {
    doc.sidebarHTML = "";
    return;
  }

  // Open menu and highlight current page.
  search.find(`a[href='${doc.mdn_url}']`).each((_i, el) => {
    $(el).parents("details").prop("open", true);
    $(el).attr("aria-current", "page");
    // Highlight, unless it already is highlighted (e.g. heading).
    if ($(el).find("em,strong").length === 0) {
      $(el).parent().wrapInner("<em></em>");
    }
  });

  doc.sidebarHTML = search.html();
  doc.sidebarMacro = search.attr("data-macro");
  search.remove();
}
