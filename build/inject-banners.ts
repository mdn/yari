import fs from "fs";
import path from "path";

import { packageBCD } from "./resolve-bcd";

// Module-level cache
let l10nStrings = {};

function initL10nStrings(root: string) {
  if (Object.keys(l10nStrings).length === 0) {
    const l10nPath = path.join(root, "jsondata", "L10n-Common.json");
    l10nStrings = JSON.parse(fs.readFileSync(l10nPath).toString());
  }
}

function getL10nString(id, locale) {
  const block = l10nStrings[id];
  // Try the locale first
  if (block && block[locale]) {
    return block[locale];
  }
  // Fall back to en-US
  if (block && block["en-US"]) {
    return block["en-US"];
  }
  // Fall back to nothing
  return null;
}

function injectBanner($, locale, messageId, bannerClass) {
  const message = getL10nString(messageId, locale);
  if (message) {
    const banner = $(`<div class="notecard ${bannerClass}">${message}</div>`);
    $("div#_body").prepend(banner);
  }
}

export function injectBanners(
  $,
  root: string,
  locale: string,
  metadata: object
) {
  initL10nStrings(root);

  const security = metadata["security-requirements"];
  if (security && security.includes("secure-context")) {
    injectBanner($, locale, "SecureContextBanner", "secure");
  }

  const bcdQuery = metadata["browser-compat"];
  if (bcdQuery) {
    const bcd = packageBCD(bcdQuery);
    if (bcd.data.__compat.status.experimental) {
      injectBanner($, locale, "ExperimentalBanner", "experimental");
    }
    if (bcd.data.__compat.status.deprecated) {
      injectBanner($, locale, "DeprecatedBanner", "deprecated");
    }
  }
}
