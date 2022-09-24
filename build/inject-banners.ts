import fs from "fs";
import path from "path";

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

function injectSecureContextBanner($, metadata, locale) {
  const security = metadata["security-requirements"];
  if (security && security.includes("secure-context")) {
    const message = getL10nString("SecureContext", locale);
    if (message) {
      const banner = $(`<div class="notecard secure">${message}</div>`);
      $("div#_body").prepend(banner);
    }
  }
}

export function injectBanners(
  $,
  root: string,
  locale: string,
  metadata: object
) {
  initL10nStrings(root);
  injectSecureContextBanner($, metadata, locale);
}
