const fs = require("fs");
const path = require("path");
const url = require("url");

export function fixBCDSections(doc, destination) {
  // Loop over, and mutate, all 'browser_compatibility' sections.

  // Note that there's *one* filter but within each forEach we're doing
  // multiple somewhat unrelated things.

  // This exists so we can keep track of which individual bcd(-{i}).json files
  // have been created.
  let bcdFiles = 0;

  doc.body
    .filter(section => section.type === "browser_compatibility")
    .forEach(section => {
      // BCD data comes froms from a library with `mdn_url`'s that are absolute.
      // This takes the `mdn_url` and sets it to a URI that can be used when
      // rendering the BCD table to link to a relative path.
      Object.entries(section.value.data).forEach(([, block]) => {
        // First block from the BCD data does not have its name as the root key
        // so mdn_url is accessible at the root. If the block has a key for
        // `__compat` it is not the first block, and the information is nested
        // under `__compat`.
        if (block.__compat) {
          block = block.__compat;
        }
        if (block.mdn_url) {
          block.mdn_url = getPathFromAbsoluteURL(block.mdn_url);
        }
      });

      // Now that everything that can has been mutated, we're going to
      // now replace the whole .value with a simple struct as well as
      // dumping it into a .json file.

      // Most pages have just 1 BCD table, but it's not a guarantee.
      const filename = bcdFiles ? `bcd-${bcdFiles + 1}.json` : "bcd.json";
      const outfile = path.join(destination, filename);
      fs.writeFileSync(
        outfile,
        process.env.NODE_ENV === "development"
          ? JSON.stringify(section.value, null, 2)
          : JSON.stringify(section.value)
      );
      bcdFiles++;
      section.value = {
        uri: path.basename(outfile),
        id: section.value.id,
        title: section.value.title
      };
    });
}

function getPathFromAbsoluteURL(absURL) {
  const u = url.parse(absURL);
  if (u.hostname !== "developer.mozilla.org") {
    // If URL is from a different host, return without modifying it
    return absURL;
  }
  // Return the pathname without docs directory, the base path for the
  // `Document` component the BCD table is within is /:locale/docs/ so it is
  // not needed.
  return u.pathname.replace("/docs/", "");
}
