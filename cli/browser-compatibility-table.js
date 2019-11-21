export function fixMdnURL(document) {
  // Loop over, and mutate, all 'browser_compatibility' sections
  document.body
    .filter(section => section.type === "browser_compatibility")
    .forEach(section => {
      Object.entries(section.value.data).forEach(([key, block]) => {
        if (!!block.__compat) {
          block = block.__compat;
        }
        if (!!block.mdn_url) {
          block.mdn_url = mutateURL(block.mdn_url);
        }
      });
    });
}

function mutateURL(mdn_url) {
  return mdn_url
    .split("/")
    .slice(4)
    .join("/");
}
