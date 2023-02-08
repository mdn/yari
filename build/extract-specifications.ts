import { packageBCD } from "./resolve-bcd.js";
import bcd from "@mdn/browser-compat-data/types";
import { Specification } from "../libs/types/document.js";
import specs from "web-specs/index.json" assert { type: "json" };
import web from "../kumascript/src/api/web.js";

export function extractSpecifications(
  query: string | undefined,
  specURLsString: string
): Specification[] {
  if (query === undefined && specURLsString === "") {
    return [];
  }

  // Collect spec URLs from a BCD feature, a 'spec-urls' value, or both;
  // For a BCD feature, it can either be a string or an array of strings.
  let specURLs: string[] = [];

  function getSpecURLs(data: bcd.Identifier) {
    // If we’re processing data for just one feature, then the 'data'
    // variable will have a __compat key. So we get the one spec_url
    // value from that, and move on.
    //
    // The value may have data for subfeatures too — each subfeature with
    // its own __compat key that may have a spec_url — but in that case,
    // for the purposes of the Specifications section, we don’t want to
    // recurse through all the subfeatures to get those spec_url values;
    // instead we only want the spec_url from the top-level __compat key.
    if (data && data.__compat) {
      const compat = data.__compat;
      if (compat.spec_url) {
        if (Array.isArray(compat.spec_url)) {
          specURLs.push(...compat.spec_url);
        } else {
          specURLs.push(compat.spec_url);
        }
      }
    } else {
      // If we get here, we’re processing data for two or more features
      // and the 'data' variable will contain multiple blocks (objects)
      // — one for each feature.
      if (!data) {
        return;
      }
      for (const block of Object.values(data)) {
        if (!block) {
          continue;
        }
        if (!("__compat" in block)) {
          // Some features — e.g., css.properties.justify-content — have
          // no compat data themselves but have subfeatures with compat
          // data. So we recurse through the nested property values until
          // we either do or don’t find any subfeatures with spec URLs.
          // Otherwise, if we’re processing multiple top-level features
          // (that is, from a browser-compat value which is an array),
          // we’d end up entirely missing the data for this feature.
          getSpecURLs(block as bcd.Identifier);
        } else {
          // If we get here, we’ve got a __compat key, and we can extract
          // any spec URLs its value may contain.
          const compat = block.__compat;
          if (compat && compat.spec_url) {
            if (Array.isArray(compat.spec_url)) {
              specURLs.push(...compat.spec_url);
            } else {
              specURLs.push(compat.spec_url);
            }
          }
        }
      }
    }
  }

  // The `spec-url` frontmatter takes precedence over spec URLs derived from `browser-compat` frontmatter.
  if (query && !specURLsString) {
    for (const feature of query.split(",").map((id) => id.trim())) {
      const { data } = packageBCD(feature);
      // If 'data' is non-null, we have data for one or more BCD features
      // that we can extract spec URLs from.
      getSpecURLs(data);
    }
  }

  if (specURLsString !== "") {
    // If specURLsString is non-empty, then it has the string contents
    // of the document’s 'spec-urls' frontmatter key: one or more URLs.
    specURLs.push(...specURLsString.split(",").map((url) => url.trim()));
  }

  // Eliminate any duplicate spec URLs
  specURLs = [...new Set(specURLs)];

  // Use BCD specURLs to look up more specification data
  // from the web-specs package
  const specifications = specURLs
    .map((specURL) => {
      const spec = specs.find(
        (spec) =>
          specURL.startsWith(spec.url) ||
          specURL.startsWith(spec.nightly.url) ||
          spec.nightly.alternateUrls.some((s) => specURL.startsWith(s)) ||
          // When grabbing series nightly, make sure we're grabbing the latest spec version
          (spec.shortname === spec.series.currentSpecification &&
            specURL.startsWith(spec.series.nightlyUrl))
      );
      const specificationsData = {
        bcdSpecificationURL: specURL,
        title: "Unknown specification",
      };
      if (spec) {
        specificationsData.title = spec.title;
      } else {
        const specList = web.getJSONData("SpecData");
        const titleFromSpecData = Object.keys(specList).find(
          (key) => specList[key]["url"] === specURL.split("#")[0]
        );
        if (titleFromSpecData) {
          specificationsData.title = titleFromSpecData;
        }
      }

      return specificationsData;
    })
    .filter(Boolean);

  return specifications;
}
