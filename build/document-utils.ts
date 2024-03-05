import { Document } from "../content/index.js";

const TRANSFORM_STRINGS = new Map(
  Object.entries({
    "Web technology for developers": "References",
    "Learn web development": "Guides",
    "HTML: HyperText Markup Language": "HTML",
    "CSS: Cascading Style Sheets": "CSS",
    "Graphics on the Web": "Graphics",
    "HTML elements reference": "Elements",
    "JavaScript reference": "Reference",
    "JavaScript Guide": "Guide",
    "Structuring the web with HTML": "HTML",
    "Learn to style HTML using CSS": "CSS",
    "Web forms — Working with user data": "Forms",
  })
);
/**
 * Temporary fix for long titles in breadcrumbs
 * @see https://github.com/mdn/yari-private/issues/612
 * @param title : the title of the document
 * @returns transformed title or original title as a string
 */
function transformTitle(title: string) {
  // if the title contains a string like `<input>: The Input (Form Input) element`,
  // return only the `<input>` portion of the title
  const htmlTagTopic = /^<\w+>/.exec(title)?.[0];
  // if the above did not match, see if it is one of the strings in the
  // transformStrings object and return the relevant replacement or
  // the unmodified title string
  return htmlTagTopic ?? TRANSFORM_STRINGS.get(title) ?? title;
}

/**
 * The breadcrumb is an array of parents including the document itself.
 * It is only added to the document if there are actual parents.
 */
export function addBreadcrumbData(url, document) {
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
        title: transformTitle(parentDoc.metadata.title),
      });
    }
  }

  if (!document.short_title) {
    document.short_title = transformTitle(document.title);
  }

  parents.push({
    uri: url,
    title: document.short_title,
  });
  document.parents = parents;
}
