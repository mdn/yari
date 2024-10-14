// Wraps tables in a scrollable figure to avoid overlapping with the TOC sidebar.
// Before: <table>...</table>
// After: <figure class="table-container"><table>...</table></figure>
import * as cheerio from "cheerio";

export function wrapTables($: cheerio.CheerioAPI) {
  const figure = $('<figure class="table-container"></figure>');
  $("table, math[display=block]").wrap(figure);
}
