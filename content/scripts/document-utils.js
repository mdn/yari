const fs = require("fs");

const Document = require("./document");

/** The breadcrumb is an array of parents include the document itself.
 * It only gets added to the document there are actual parents.
 */
function addBreadcrumbData(url, document) {
  const parents = [];
  let split = url.split("/");
  let parentUri;
  while (split.length > 2) {
    split.pop();
    parentUri = split.join("/");
    // This test makes it possible to "skip" certain URIs that might not
    // be a page on its own. For example: /en-US/docs/Web/ is a page,
    // and so is /en-US/ but there might not be a page for /end-US/docs/.
    const metadata = Document.read(parentUri);
    if (metadata) {
      parents.unshift({
        uri: parentUri,
        title: metadata.title,
      });
    }
  }
  if (parents.length) {
    parents.push({
      uri: url,
      title: document.short_title || document.title,
    });
    document.parents = parents;
  }
}

module.exports = { addBreadcrumbData };
