const { Document } = require("../content");

/** The breadcrumb is an array of parents include the document itself.
 * It only gets added to the document there are actual parents.
 */
function addBreadcrumbData(url, document) {
  const parents = [];
  const split = url.split("/");
  let parentURL;
  // If the URL was something like `/en-US/docs/Foo/Bar` when you split
  // that, the array becomes `['', 'en-US', 'docs', 'Foo', 'Bar']`
  // And as length, that's `[1, 2, 3, 4, 5]`. Therefore, there's never
  // any point of going for 1, 2, or 3 since that's just the home page
  // which we don't ever include in the breadcrumb trail.
  while (split.length > 4) {
    split.pop();
    parentURL = split.join("/");
    // This test makes it possible to "skip" certain URIs that might not
    // be a page on its own. For example: /en-US/docs/Web/ is a page,
    // and so is /en-US/ but there might not be a page for /end-US/docs/.

    const parentDoc = Document.findByURL(parentURL);
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
