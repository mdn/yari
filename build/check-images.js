// XXX Consider moving this to 'flaws.js'
// Or, something. Checking for flaws should be very different from checking
// for images.

const path = require("path");

const sizeOf = require("image-size");

const { Document, Image } = require("../content");
const { FLAW_LEVELS } = require("./constants");
const { findMatchesInText } = require("./matches-in-text");

/**
 * Mutate the `$` instance for image reference and if appropriate,
 * log them as flaws if they're not passing linting.
 *
 */
function checkImageReferences(doc, $, options, { url, rawContent }) {
  const filePaths = new Set();
  if (doc.isArchive) return filePaths;

  const checkImages = options.flawLevels.get("images") !== FLAW_LEVELS.IGNORE;

  function addImageFlaw(
    $img,
    src,
    { explanation, externalImage = false, suggestion = null }
  ) {
    for (const match of findMatchesInText(src, rawContent, {
      attribute: "src",
    })) {
      if (!("images" in doc.flaws)) {
        doc.flaws.images = [];
      }
      let fixable = false;
      if (suggestion) {
        $img.attr("src", suggestion);
        fixable = true;
      }
      const id = `image${doc.flaws.images.length + 1}`;
      $img.attr("data-flaw", id);
      doc.flaws.images.push({
        id,
        src,
        fixable,
        suggestion,
        explanation,
        externalImage,
        ...match,
      });
    }
  }

  const checked = new Set();
  $("img[src]").each((i, element) => {
    const img = $(element);
    const src = img.attr("src");

    // If the HTML contains the exact same 'src' value more than once,
    // it will be found exactly that many times within the addImageFlaw()
    // function which uses `findMatchesInText` so if it's repeated,
    // it'll be logged for each individual occurance.
    if (checked.has(src)) return;
    checked.add(src);

    // These two lines is to simulate what a browser would do.
    const baseURL = `http://yari.placeholder${url}/`;
    const absoluteURL = new URL(src, baseURL);

    // NOTE: Checking for lacking 'alt' text is to be done as part
    // of https://github.com/mdn/yari/issues/1018 which would need
    // a new function dedicated to that.
    let finalSrc = null;

    if (!src.trim()) {
      if (checkImages) {
        addImageFlaw(img, src, {
          explanation: "Empty img 'src' attribute",
        });
      }
    } else if (absoluteURL.host !== "yari.placeholder") {
      // It's a remote file. Don't bother much with this. Unless...
      if (checkImages) {
        if (absoluteURL.protocol === "http:") {
          // Force the image to be HTTPS
          absoluteURL.protocol = "https:";
          addImageFlaw(img, src, {
            explanation: "Insecure URL",
            suggestion: absoluteURL.toString(),
          });
        } else if (absoluteURL.hostname === "developer.mozilla.org") {
          // Suppose they typed this:
          // <img src=https://developer.mozilla.org/en-US/docs/Foo/img.png>
          // and the current page you're on is /en-US/docs/Foo then the
          // suggestion should be just `img.png`.
          const suggestion = absoluteURL.pathname.includes(`${doc.mdn_url}/`)
            ? absoluteURL.pathname.replace(`${doc.mdn_url}/`, "")
            : absoluteURL.pathname;
          addImageFlaw(img, src, {
            explanation: "Unnecessarily absolute URL",
            suggestion,
          });
          // This one's a bit of an exception. Going forward the suggestion
          // might be something like `screenshot.png` for the sake of rendering
          // it now, we still want the full relative URL.
          img.attr("src", absoluteURL.pathname);
        } else {
          addImageFlaw(img, src, {
            explanation: "External image URL",
            externalImage: true,
          });
        }
      }
    } else {
      // Remember, you can not have search parameters on local images.
      // It might make sense on something like `https://unsplash.it/image/abc?size=100`
      // but all our images are going to static.
      finalSrc = absoluteURL.pathname;
      // We can use the `finalSrc` to look up and find the image independent
      // of the correct case because `Image.findByURL` operates case
      // insensitively.
      const filePath = Image.findByURL(finalSrc);
      if (filePath) {
        filePaths.add(filePath);
      }

      if (checkImages) {
        if (!filePath) {
          // E.g. <img src="doesnotexist.png"
          addImageFlaw(img, src, {
            explanation: "File not present on disk",
          });
        } else {
          if (!src.includes("/") || src.startsWith("./")) {
            // Always build the `finalSrc` based on correct case.
            finalSrc = path.join(`${url}/`, src.toLowerCase());
            // Clearly, it worked but was the wrong case used?
            if (finalSrc !== path.join(`${url}/`, src)) {
              // E.g. <img src="wRonGCaSE.PNg"> or <img src="./WrONgcAse.pnG">
              addImageFlaw(img, src, {
                explanation: "Pathname should always be lowercase",
                suggestion: src.toLowerCase(),
              });
            }
          } else {
            // This will always be non-null because independent of the
            // image name, if the file didn't exist the document doesn't exist.
            const parentDocument = Document.findByURL(path.dirname(finalSrc));

            // Base the final URL on the parent document + image file name lowercase.
            finalSrc = `${parentDocument.url}/${path
              .basename(finalSrc)
              .toLowerCase()}`;

            if (src.startsWith("/")) {
              // E.g. <img src="/en-US/docs/Web/Images/foo.gif"
              const suggestion = path.join(
                path.relative(url, parentDocument.url),
                path.basename(finalSrc)
              );
              addImageFlaw(img, src, {
                explanation: "Pathname should be relative to document",
                suggestion,
              });
            }
          }
        }
      }
      img.attr("src", finalSrc);
    }
    if (doc.flaws.images && doc.flaws.images.length) {
      if (options.flawLevels.get("images") === FLAW_LEVELS.ERROR) {
        throw new Error(`images flaws: ${JSON.stringify(doc.flaws.images)}`);
      }
    }
  });

  return filePaths;
}

/**
 * Mutate the `$` instance for image reference and if appropriate,
 * log them as flaws if they're not passing linting.
 * Look for <img> tags that set a `style="width: XXXpx; height: YYYpx"`
 * and or not have the `width="XXX" height="XXX"` plain attributes.
 *
 * Don't check the `src` attribute.
 *
 * TODO: Perhaps in the future, we can also check if the `style` attribute
 * has some hardcoded patterns for margins and borders that would be
 * best to set "centrally" with a style sheet.
 */
function checkImageTags(doc, $, options, { url, rawContent }) {
  const filePaths = new Set();
  if (doc.isArchive) return filePaths;

  const checkImages =
    options.flawLevels.get("image_widths") !== FLAW_LEVELS.IGNORE;

  $("img").each((i, element) => {
    const img = $(element);
    const suggestion = {};
    // If it already has a `width` attribute, leave this as is.
    if (!img.attr("width")) {
      // Remove any `width` or `height` specified in the `style` attribute
      // because this is best to leave so the browser doesn't stretch
      // the image if its specified dimension (even if it's accurate!)
      // can't be kept in the given context.
      if (img.attr("style")) {
        if (img.attr("style").includes("@")) {
          console.warn(
            "Dare to use regex on inline `img[style]` values that use media queries of any kind.",
            img.attr("style")
          );
          return;
        }
        // The confidence to use a regex instead of a proper CSS parser is
        // because we're only ever looking at the CSS in `img[style]` contexts.
        // These are much simpler than the kind of CSS you should never go
        // near with a regex.
        const originalStyleValue = img.attr("style");
        const newStyleValue = originalStyleValue
          .split(";")
          .map((each) => each.split(":"))
          .filter((parts) => {
            return !["width", "height"].includes(parts[0].trim());
          })
          .map((parts) => parts.join(":"))
          .join(";");

        if (newStyleValue !== originalStyleValue) {
          // If there's nothing left, don't just set a new value, make
          // it delete the 'style' attribute altogether.
          if (newStyleValue) {
            img.attr("style", newStyleValue);
            suggestion.style = newStyleValue;
          } else {
            img.removeAttr("style");
            suggestion.style = null;
          }
        }
      }

      // If image is local, get its dimension and set the `width` and `height`
      // HTML attributes.
      if (!img.attr("src").includes("://")) {
        const filePath = Image.findByURL(img.attr("src"));
        if (filePath) {
          const dimensions = sizeOf(filePath);
          img.attr("width", `${dimensions.width}`);
          img.attr("height", `${dimensions.height}`);
        }
      }
    }
  });

  if (doc.flaws.image_widths && doc.flaws.image_widths.length) {
    if (options.flawLevels.get("image_widths") === FLAW_LEVELS.ERROR) {
      throw new Error(
        `images width flaws: ${JSON.stringify(doc.flaws.image_widths)}`
      );
    }
  }
}

module.exports = { checkImageReferences, checkImageTags };
