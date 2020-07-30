const { Document } = require("content");

/** The breadcrumb is an array of parents include the document itself.
 * It only gets added to the document there are actual parents.
 */
function addBreadcrumbData(url, document) {
  const parents = [];
  let split = url.split("/");
  let parentURL;
  while (split.length > 2) {
    split.pop();
    parentURL = split.join("/");
    // This test makes it possible to "skip" certain URIs that might not
    // be a page on its own. For example: /en-US/docs/Web/ is a page,
    // and so is /en-US/ but there might not be a page for /end-US/docs/.

    const parentDoc = Document.findByURL(parentURL, { metadata: true });
    if (parentDoc) {
      parents.unshift({
        uri: parentURL,
        title: parentDoc.metadata.title,
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
