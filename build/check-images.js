// XXX Consider moving this to 'flaws.js'
// Or, something. Checking for flaws should be very different from checking
// for images.

const path = require("path");

const { Document, Image } = require("content");
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

  function addImageFlaw(src, id, { explanation, suggestion = null }) {
    for (const match of findMatchesInText(src, rawContent, {
      attribute: "src",
    })) {
      if (!("images" in doc.flaws)) {
        doc.flaws.images = [];
      }
      doc.flaws.images.push(
        Object.assign({ id, src, suggestion, explanation }, match)
      );
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

    const imageID = `images${i}`;
    let countFlaws = 0;

    // NOTE: Checking for lacking 'alt' text is to be done as part
    // of https://github.com/mdn/yari/issues/1018 which would need
    // a new function dedicated to that.
    let finalSrc = null;

    if (absoluteURL.host !== "yari.placeholder") {
      // It's a remote file. Don't bother much with this. Unless...
      if (checkImages) {
        if (absoluteURL.protocol === "http:") {
          // Force the image to be HTTPS
          absoluteURL.protocol = "https:";
          img.attr("src", absoluteURL.toString());
          addImageFlaw(src, imageID, {
            explanation: "Insecure URL",
            suggestion: absoluteURL.toString(),
          });
          countFlaws++;
        } else if (absoluteURL.hostname === "developer.mozilla.org") {
          img.attr("src", absoluteURL.pathname);
          addImageFlaw(src, imageID, {
            explanation: "Unnecessarily absolute URL",
            suggestion: absoluteURL.pathname,
          });
          countFlaws++;
        }

        // TODO: It might be prudent to cease allowing any remote images.
        // If you rely on an external domain that isn't our designated
        // default domain, we should probably download it and check it in.
        // It means less SSL and network overheads if we can download all
        // images on an existing HTTP2 connection, and if the domain is
        // something out of our control we're potentially at mercy of the
        // images suddenly disappearing.
        // Due to so much else going on, let's not make a huge stink about
        // it at the moment (peterbe, Aug 2020).
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
          addImageFlaw(src, imageID, {
            explanation: "File not present on disk",
          });
          countFlaws++;
        } else {
          if (!src.includes("/") || src.startsWith("./")) {
            // Always build the `finalSrc` based on correct case.
            finalSrc = path.join(`${url}/`, src.toLowerCase());
            // Clearly, it worked but was the wrong case used?
            if (finalSrc !== path.join(`${url}/`, src)) {
              // E.g. <img src="wRonGCaSE.PNg"> or <img src="./WrONgcAse.pnG">
              addImageFlaw(src, imageID, {
                explanation: "Pathname should always be lowercase",
                suggestion: src.toLowerCase(),
              });
              countFlaws++;
            }
          } else {
            // This will always be non-null because independent of the
            // image name, if the file didn't exist the document doesn't exist.
            const parentDocument = Document.findByURL(path.dirname(finalSrc), {
              metadata: true,
            });

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
              addImageFlaw(src, imageID, {
                explanation: "Pathname should be relative to document",
                suggestion,
              });
              countFlaws++;
            }
          }
        }
      }
      img.attr("src", finalSrc);
    }
    if (countFlaws) {
      img.attr("data-flaw", imageID);

      if (options.flawLevels.get("images") === FLAW_LEVELS.ERROR) {
        throw new Error(`images flaws: ${JSON.stringify(doc.flaws.images)}`);
      }
    }
  });

  return filePaths;
}

module.exports = { checkImageReferences };
