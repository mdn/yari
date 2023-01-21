// Remove h4s from any existing notecards and transform them
// from <div class="note notecard"><h4>Note:</h4>foobar</div> to
// <div class="note notecard"><p><strong>Note:</strong>foobar</p></div>
import * as cheerio from "cheerio";

export function formatNotecards($: cheerio.CheerioAPI) {
  $("div.notecard h4").each((_, element) => {
    const h4 = $(element);
    const text = h4.text();
    const div = h4.parent("div.notecard");
    const p = $("p:first", div);

    // Return filtered collection of elements that are
    // text nodes and remove the node while were at it,
    // also trimming away any leading/trailing space
    const textNodes = div
      .contents()
      .filter((_, element) => {
        return element.nodeType === 3;
      })
      .remove()
      .text()
      .trim();

    if (!textNodes.length) {
      p.html(`<strong>${text}:</strong> ${p.html()}`);
    } else {
      div.append(`<p>${p.html()}</p>`);
      p.html(`<strong>${text}:</strong> ${textNodes}`);
    }

    h4.remove();
  });
}
