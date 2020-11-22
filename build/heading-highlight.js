/**
 * Uses a regular expression to replace spaces with an underscore.
 *
 * @param {String} id The string to generate an ID from.
 * @returns {String} The unique ID string.
 */
function uniqueH3ID(id) {
  return id.replace(/\s+/gm, "_");
}

/**
 * Mutate the $ instance by looking for <h3> tags that can
 * be converted into direct links.
 *
 * @param {Object} $ The cheerio object to be mutated.
 * @param {Object} doc The document data.
 * @returns {HTMLElement} The sub heading with a direct link added.
 *
 */
function headingHighlight($, doc) {
  $("h3").each((i, header) => {
    const $header = $(header);
    let textContent = $header.text();
    let fallbackID = uniqueH3ID($header.attr("id"));

    if (!$header) {
      console.warn(
        `Found ${i} <h3> tags on the document, unable to highlight page: ${doc.mdn_url}`
      );
      return; // bail
    }

    // if first character of an ID doesn't start
    // with [a-zA-Z] inject an underscore
    const regExp = new RegExp(/^[^a-zA-Z]+/, "g");
    if (regExp.test(textContent)) {
      let id = uniqueH3ID(textContent);
      $header.attr("id", `_${id}`);
    } else if (regExp.test($header.attr("id"))) {
      let id = $header.attr("id");
      $header.attr("id", `_${id}`);
    }

    // if id exists use it for anchors href
    if ($header.attr("id")) {
      let id = $header.attr("id");
      let link = $(`<a href='#${id}'>${textContent}</a>`);
      $header.attr("id", `${id}`);
      $header.prepend(link);
      $header.text("");
    } else {
      let id = uniqueH3ID(textContent);
      let link = $(`<a href='#${id}'>${textContent}</a>`);

      // if duplicate ID, append duplicate number to the end
      // of the string.. more than 2 duplicates things go wrong
      // since I'm using j=1 (i counts h3 tags in the .each loop)
      let duplicate = $(`h3:contains('${textContent}')`).eq(1);
      let j = 1;
      duplicate.attr("id", `${id}_${j + 1}`);
      $header.attr("id", `${id}`);
      $header.prepend(link);
      $header.text("");
    }
    return $header.prepend(`<a href='#${fallbackID}'>${textContent}</a>`);
  });
}

module.exports = {
  headingHighlight,
  uniqueH3ID,
};
