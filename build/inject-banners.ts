import fs from "node:fs";
import path from "node:path";

import { CONTENT_ROOT } from "../libs/env/index.js";

// Module-level cache
let l10nStrings = {};

function initL10nStrings(root: string) {
  if (Object.keys(l10nStrings).length === 0) {
    const l10nPath = path.join(root, "jsondata", "L10n-Banners.json");
    l10nStrings = JSON.parse(fs.readFileSync(l10nPath).toString());
  }
}

function getL10nString(id, locale) {
  const block = l10nStrings[id];
  return block[locale] ?? block[DEFAULT_LOCALE] ?? null;
}

function injectBanner($, locale, titleId, descriptionId, bannerClass) {
  const title = getL10nString(titleId, locale);
  const description = getL10nString(descriptionId, locale);

  if (title && description) {
    const banner = $(
      `<div class="notecard ${bannerClass}"><strong>${title}: </strong>${description}</div>`
    );

    $("body").prepend(banner);
  }
}

export function injectBanners($, locale: string, metadata: object) {
  initL10nStrings(CONTENT_ROOT);
  const status = metadata["status"];
  if (status && status.includes("deprecated")) {
    injectBanner(
      $,
      locale,
      "Deprecated_title",
      "Deprecated_description",
      "deprecated"
    );
  }
  if (status && status.includes("experimental")) {
    injectBanner(
      $,
      locale,
      "Experimental_title",
      "Experimental_description",
      "experimental"
    );
  }
  if (status && status.includes("non-standard")) {
    injectBanner(
      $,
      locale,
      "NonStandard_title",
      "NonStandard_description",
      "nonstandard"
    );
  }
}
