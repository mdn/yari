const url = require("url");

const { Document, Redirect } = require("content");
const { FLAW_LEVELS } = require("./constants");
/**
 * Loop over, and mutate, all 'browser_compatibility' sections.
 * BCD data comes froms from a library with `mdn_url`'s that are absolute.
 * This takes the `mdn_url` and sets it to a URI that can be used when
 * rendering the BCD table to link to a relative path.
 *
 * Also, if enabled, check all of these inner `mdn_url` for flaws.
 *
 */
function normalizeBCDMdnURLs(doc, options) {
  let checkLinks = false;

  if (options.flawLevels.get("bad_bcd_links") !== FLAW_LEVELS.IGNORE) {
    checkLinks = true;
  }

  function addBadBCDLink(query, key, slug, suggestion = null) {
    if (!("bad_bcd_links" in doc.flaws)) {
      doc.flaws.bad_bcd_links = [];
    }
    doc.flaws.bad_bcd_links.push({
      slug,
      suggestion,
      query,
      key,
    });
  }

  function getPathFromAbsoluteURL(absURL) {
    // Because the compat data is mutated out of mdn-browser-compat-data,
    // through our `packageBCD` function, it's very possible that
    // the `doc[i].type === 'browser_compatibility` has already been
    // processed.
    if (!absURL.includes("://")) {
      return absURL;
    }
    const u = url.parse(absURL);
    if (u.hostname !== "developer.mozilla.org") {
      // If URL is from a different host, return without modifying it
      return absURL;
    }
    // Return the pathname without docs directory, the base path for the
    // `Document` component the BCD table is within is /:locale/docs/ so it is
    // not needed.
    // The `mdn_url` field in BCD data is always like this:
    // https://developer.mozilla.org/docs/Web/API/MediaTrackSettings/width
    // So to get the appropriate slug, in Yari, we have to assume a locale.
    let slug = u.pathname;
    if (slug.startsWith("/docs/")) {
      // Important! For now, to make this a slug we can understand we
      // have to have a locale and we pick `en-US` as the default.
      return `/en-US${slug}`;
    }
    throw new Error(`not implemented! ${slug}`);
  }

  doc.body
    .filter((section) => section.type === "browser_compatibility")
    .forEach((section) => {
      Object.entries(section.value.data).forEach(([key, block]) => {
        // First block from the BCD data does not have its name as the root key
        // so mdn_url is accessible at the root. If the block has a key for
        // `__compat` it is not the first block, and the information is nested
        // under `__compat`.
        if (block.__compat) {
          block = block.__compat;
        }
        if (block.mdn_url) {
          const slug = getPathFromAbsoluteURL(block.mdn_url);
          block.mdn_url = slug;
          if (checkLinks && slug.startsWith("/")) {
            // Now we need to scrutinize if that's a slug we can fully
            // recognize. (But only if it's a relative link)
            const slugNormalized = slug.toLowerCase();
            const found = Document.findByURL(hrefNormalized, {
              metadata: true,
            });
            if (!found) {
              // That means trouble!
              // But can it be salvaged with a redirect?
              const resolved = Redirect.resolve(slugNormalized);
              if (resolved) {
                // Just because it's a redirect doesn't mean it ends up
                // on a page we have.
                // For example, there might be a redirect but where it
                // goes to is not in this.allTitles.
                // This can happen if it's a "fundamental redirect" for example.
                const finalDocument = Document.findByURL(resolved, {
                  metadata: true,
                });
                const suggestion = finalDocument ? finalDocument.url : null;
                addBadBCDLink(query, key, slug, suggestion);
                block.mdn_url = suggestion;
              } else {
                addBadBCDLink(section.value.query, key, slug);
                // If the slug is bad, and can't be salvaged with a redirect,
                // we need to pass that information on so that it can be
                // leveraged in the UI that displays the BCD table.
                // That way, it knows to not attempt to make a link out of it.
                block.bad_slug = true;
              }
            }
          }
        }
      });
    });
}

module.exports = { normalizeBCDMdnURLs };
