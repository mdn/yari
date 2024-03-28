import { Document } from "../content/index.js";
import { Doc } from "../libs/types/document.js";

/**
 * Return the appropriate document title to go into the HTML <title>
 * tag on the final HTML.
 *
 * This value should generally be the document's own title followed
 * by the parent's title followed by the word "MDN".
 *
 * The origin of this business logic is that from Kuma. You know, for
 * the sake of parity and the assumption of the hard work for SEO
 * done when Kuma was the platform.
 *
 */
export function getPageTitle(doc: Partial<Doc>) {
  const docURL = doc.mdn_url;
  const rootParentURL = getRootURL(docURL);
  let title = doc.title;
  if (rootParentURL && rootParentURL !== docURL) {
    const parentDoc = Document.findByURL(rootParentURL.toLowerCase());
    if (parentDoc && parentDoc.metadata && parentDoc.metadata.title) {
      title += ` - ${parentDoc.metadata.title}`;
    }
  }
  return `${title} | MDN`;
}

// When traversing up to the root document, there are certain "roots"
// that indicate that you've gone too far and should consider going a
// little bit deeper.
// For example, for the "Web" area, if you can, go one level deeper
// to things like "Web/HTML". This set defines which "root slugs" we
// ought to consider going deeper on.
const BAD_ROOTS = new Set(["Web"]);

/**
 * Return the root URL based on specific rules.
 */
export function getRootURL(url: string) {
  const split = url.split("/");
  // If "url" was "/$locale/docs/Foo/Bar/Bez" the thing to return
  // is "/$locale/docs/Foo".
  // But if the last part of the URL is in a special set, we know we
  // should go a little deeper.
  let index = 4;
  if (BAD_ROOTS.has(split[index - 1])) {
    index++;
  }
  return split.slice(0, index).join("/");
}
