import { KumaThis } from "../environment.js";
import { getBadgeTemplates } from "../lib/badges.js";
import { getCSSSyntax } from "../lib/css-syntax.js";

const page = {
  // Determines whether or not the page has the specified tag. Returns
  // true if it does, otherwise false. This is case-insensitive.
  //
  hasTag(aPage, aTag) {
    // First, return false at once if there are no tags on the page

    if (
      aPage.tags == undefined ||
      aPage.tags == null ||
      aPage.tags.length == 0
    ) {
      return false;
    }

    // Convert to lower case for comparing

    const theTag = aTag.toLowerCase();

    // Now look for a match

    for (let i = 0; i < aPage.tags.length; i++) {
      if (aPage.tags[i].toLowerCase() == theTag) {
        return true;
      }
    }

    return false;
  },

  // Optional path, defaults to current page
  //
  // Optional depth. Ignored. The caller may request subpages
  // as deeply as desired.
  //
  // Optional self, defaults to false. Include the path page in
  // the results
  //
  subpagesExpand(this: KumaThis, path, _depth, self) {
    try {
      return this.info.getChildren(path || this.env.url, self);
    } catch (error) {
      if (error instanceof Error) {
        this.env.recordNonFatalError("bad-pages", error.message);
      }
      // We allow ourselves to be forgiving with this function because
      // we justify it by the fact that at least we record a flaw!
      return [];
    }
  },

  translations(this: KumaThis, path) {
    return this.info.getTranslations(path || this.env.url);
  },

  async badges(this: KumaThis, aPage) {
    return await getBadgeTemplates(this, aPage);
  },

  async cssSyntax(this: KumaThis, slug?: string) {
    return await getCSSSyntax(this, slug);
  },
};

export default page;
