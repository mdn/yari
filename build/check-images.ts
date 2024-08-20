// XXX Consider moving this to 'flaws.js'
// Or, something. Checking for flaws should be very different from checking
// for images.

import path from "node:path";

import imagesize from "image-size";

import { Document, FileAttachment } from "../content/index.js";
import { FLAW_LEVELS } from "../libs/constants/index.js";
import { findMatchesInText, findMatchesInMarkdown } from "./matches.js";
import * as cheerio from "cheerio";
import { Doc } from "../libs/types/document.js";

const { default: sizeOf } = imagesize;

/**
 * Mutate the `$` instance for image reference and if appropriate,
 * log them as flaws if they're not passing linting.
 *
 */
export function checkImageReferences(
  doc: Partial<Doc>,
  $: cheerio.CheerioAPI,
  options,
  { url, rawContent }
): Map<string, string> {
  // imageMap is a map of basename to full path
  const imageMap = new Map<string, string>();

  const checkImages = options.flawLevels.get("images") !== FLAW_LEVELS.IGNORE;

  const checked = new Map<string, number>();

  function addImageFlaw(
    $img: cheerio.Cheerio<cheerio.Element>,
    src: string,
    {
      explanation,
      externalImage = false,
      suggestion = null,
    }: {
      explanation: string;
      externalImage?: boolean;
      suggestion?: string;
    }
  ) {
    // If the document has *two* `<img src="XXX">` tags, this function
    // (addImageFlaw) is called two times. We can then assume the
    // findMatchesInText() will find it two times too. For each call,
    // we need to match the call based in counting matches from findMatchesInText().
    const matches = doc.isMarkdown
      ? findMatchesInMarkdown(src, rawContent, { type: "image" })
      : findMatchesInText(src, rawContent, { attribute: "src" });
    const checkedBefore = checked.get(src) ?? 0;
    if (matches.length <= checkedBefore) {
      console.warn(
        `Could not find enough matches for src: ${src}, index ${checkedBefore} out of bounds`
      );
      return;
    }
    const match = matches[checkedBefore];
    if (!("images" in doc.flaws)) {
      doc.flaws.images = [];
    }
    const fixable = Boolean(suggestion);
    if (suggestion) {
      $img.attr("src", suggestion);
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

    // Use this to remember which in the list of matches we've dealt with.
    checked.set(src, checkedBefore + 1);
  }

  $("img[src]").each((i, element) => {
    const img = $(element);
    const src = img.attr("src");

    // These two lines is to simulate what a browser would do.
    const baseURL = `http://yari.placeholder${url}/`;
    // Make a special exception for the legacy images that start with `/files/...`
    // If you just pretend their existing URL is static external domain, it
    // will be recognized as an external image (which is fixable).
    const absoluteURL = /^\/files\/\d+/.test(src)
      ? new URL(`https://mdn.mozillademos.org${src}`)
      : new URL(src, baseURL);

    // NOTE: Checking for lacking 'alt' text is to be done as part
    // of https://github.com/mdn/yari/issues/1018 which would need
    // a new function dedicated to that.
    let finalSrc = null;

    if (!src.split("#")[0].trim()) {
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
            suggestion: null,
          });
        }
      }
    } else {
      // Remember, you can not have search parameters on local images.
      // It might make sense on something like `https://unsplash.it/image/abc?size=100`
      // but all our images are going to be static.
      finalSrc = absoluteURL.pathname;
      // We can use the `finalSrc` to look up and find the image independent
      // of the correct case because `FileAttachment.findByURLWithFallback`
      // operates case insensitively.

      const filePath = FileAttachment.findByURLWithFallback(finalSrc);

      if (filePath) {
        imageMap.set(path.basename(filePath), filePath);
      }

      if (checkImages) {
        if (!filePath) {
          // E.g. <img src="doesnotexist.png"
          addImageFlaw(img, src, {
            explanation:
              "File not present on disk, an empty file, or not an image",
          });
        } else if (!src.includes("/") || src.startsWith("./")) {
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
      img.attr("src", finalSrc);
    }
    if (
      doc.flaws.images &&
      doc.flaws.images.length &&
      options.flawLevels.get("images") === FLAW_LEVELS.ERROR
    ) {
      throw new Error(`images flaws: ${JSON.stringify(doc.flaws.images)}`);
    }
  });

  return imageMap;
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
export function checkImageWidths(
  doc: Partial<Doc>,
  $: cheerio.CheerioAPI,
  options,
  { rawContent }
) {
  const checkImages =
    options.flawLevels.get("image_widths") !== FLAW_LEVELS.IGNORE;

  const checked = new Map();

  function addStyleFlaw(
    $img: cheerio.Cheerio<cheerio.Element>,
    style: string,
    suggestion: string
  ) {
    if (!("image_widths" in doc.flaws)) {
      doc.flaws.image_widths = [];
    }
    const id = `image_widths${doc.flaws.image_widths.length + 1}`;
    $img.attr("data-flaw", id);
    const matches = findMatchesInText(style, rawContent, {
      attribute: "style",
    });
    const checkedBefore = checked.get(style) || 0;
    matches.forEach((match, i) => {
      if (i !== checkedBefore) {
        return;
      }
      const fixable = suggestion !== null;
      let explanation = "";
      if (style.includes("width") && style.includes("height")) {
        explanation = "'width' and 'height'";
      } else if (style.includes("height")) {
        explanation = "'height'";
      } else {
        explanation = "'height'";
      }
      explanation += " set in 'style' attribute on <img> tag.";
      doc.flaws.image_widths.push({
        id,
        style,
        fixable,
        suggestion,
        explanation,
        ...match,
      });
      // Use this to remember which in the list of matches we've dealt with.
      checked.set(style, checkedBefore + 1);
    });
  }

  $("img").each((i, element) => {
    const img = $(element);
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
          .join(";")
          .trim();

        let suggestion = null;
        if (newStyleValue !== originalStyleValue) {
          // If there's nothing left, don't just set a new value, make
          // it delete the 'style' attribute altogether.
          if (newStyleValue) {
            suggestion = newStyleValue;
            img.attr("style", newStyleValue);
          } else {
            suggestion = "";
            img.removeAttr("style");
          }
          // Remember, only if you're interested in checking for flaws, do we
          // record this. But we also apply the fix nomatter what.
          if (checkImages) {
            addStyleFlaw(img, originalStyleValue, suggestion);
          }
        }
      }

      // If image is local, get its dimension and set the `width` and `height`
      // HTML attributes.
      const imgSrc = img.attr("src");

      if (!imgSrc) {
        console.warn(
          `In ${doc.mdn_url} there's an img tag without src (${$.html(img)})`
        );
        return;
      }

      // Only proceed if it's not an external image.
      // But beyond that, suppose the `<img>` tag looks anything other than
      // `<img src="/local/docs/slug">` then we can't assume the `img[src]` can
      // be resolved. For example, suppose the HTML contains `<img src="404.png">`
      // then it's a broken image and it's handled by the `checkImageReferences()`
      // function. Stay away from those.
      if (!imgSrc) {
        if (options.flawLevels.get("image_widths") === FLAW_LEVELS.ERROR) {
          throw new Error(
            `images width flaws: ${JSON.stringify(doc.flaws.image_widths)}`
          );
        }
      } else if (!imgSrc.includes("://") && imgSrc.startsWith("/")) {
        const filePath = FileAttachment.findByURLWithFallback(imgSrc);
        if (filePath) {
          const dimensions = sizeOf(filePath);
          img.attr("width", `${dimensions.width}`);
          img.attr("height", `${dimensions.height}`);
        }
      }
    }
  });

  if (
    doc.flaws.image_widths &&
    doc.flaws.image_widths.length &&
    options.flawLevels.get("image_widths") === FLAW_LEVELS.ERROR
  ) {
    throw new Error(
      `images width flaws: ${JSON.stringify(doc.flaws.image_widths)}`
    );
  }
}
