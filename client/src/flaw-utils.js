/**
 * This file serves to help flaws when displayed one at a time and when
 * displayed in batches.
 *
 */

export function humanizeFlawName(name) {
  const verboseNames = {
    // List all the names that can't be nicely computed by the fallback()
    // function.
    bad_bcd_queries: "Bad BCD queries",
    bad_bcd_links: "Bad BCD links",
    bad_pre_tags: "Bad <pre> tags",
    unsafe_html: "Unsafe HTML",
  };
  function fallback() {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " ");
  }
  return verboseNames[name] || fallback();
}
