import { KumaThis } from "../environment";

const badgeTemplates = {
  ExperimentalBadge: "",
  NonStandardBadge: "",
  DeprecatedBadge: "",
  ObsoleteBadge: "",
};
let badgeTemplatesLoaded = false;

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

  async badges(this: KumaThis, aPage, spaceAround = false) {
    const badgeTemplates = await getBadgeTemplates(this);

    const space = spaceAround ? " " : "";
    let pageBadges = "";

    if (page.hasTag(aPage, "Experimental")) {
      pageBadges += space + badgeTemplates.ExperimentalBadge;
    }

    if (page.hasTag(aPage, "Non-standard")) {
      pageBadges += space + badgeTemplates.NonStandardBadge;
    }

    if (page.hasTag(aPage, "Deprecated")) {
      pageBadges += space + badgeTemplates.DeprecatedBadge;
    }

    if (page.hasTag(aPage, "Obsolete")) {
      pageBadges += space + badgeTemplates.ObsoleteBadge;
    }
    return pageBadges;
  },
};

async function getBadgeTemplates(kuma: KumaThis) {
  if (!badgeTemplatesLoaded) {
    await loadBadgeTemplates(kuma);
    badgeTemplatesLoaded = true;
  }
  return badgeTemplates;
}

async function loadBadgeTemplates(kuma: KumaThis) {
  async function loadBadge(name: string) {
    badgeTemplates[name] = (await kuma.template(name)) as string;
  }

  const templateNames = Object.getOwnPropertyNames(badgeTemplates);
  await Promise.all(templateNames.map((n) => loadBadge(n)));
}

export default page;
