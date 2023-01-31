import { KumaThis } from "../environment";
import page from "../api/page";

const badges = [
  {
    tag: "Experimental",
    macro: "ExperimentalBadge",
    template: "",
  },
  {
    tag: "Non-standard",
    macro: "NonStandardBadge",
    template: "",
  },
  {
    tag: "Deprecated",
    macro: "DeprecatedBadge",
    template: "",
  },
  {
    tag: "Obsolete",
    macro: "ObsoleteBadge",
    template: "",
  },
];

let badgeTemplatesLoaded = false;

export async function getBadgeTemplates(kuma: KumaThis, aPage: any) {
  await assertTemplatesLoaded(kuma);

  return badges
    .filter(({ tag }) => page.hasTag(aPage, tag))
    .map(({ template }) => template);
}

async function assertTemplatesLoaded(kuma: KumaThis) {
  if (!badgeTemplatesLoaded) {
    await loadBadgeTemplates(kuma);
    badgeTemplatesLoaded = true;
  }
  return badges;
}

async function loadBadgeTemplates(kuma: KumaThis) {
  async function loadBadge(badge: (typeof badges)[0]) {
    badge.template = (await kuma.template(badge.macro)) as string;
  }

  await Promise.all(badges.map(loadBadge));
}
