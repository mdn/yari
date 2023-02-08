import { KumaThis } from "../environment.js";
import page from "../api/page.js";

const badges = [
  {
    status: "experimental",
    tag: "Experimental",
    macro: "ExperimentalBadge",
    template: "",
  },
  {
    status: "non-standard",
    tag: "Non-standard",
    macro: "NonStandardBadge",
    template: "",
  },
  {
    status: "deprecated",
    tag: "Deprecated",
    macro: "DeprecatedBadge",
    template: "",
  },
];

let badgeTemplatesLoaded = false;

export async function getBadgeTemplates(kuma: KumaThis, aPage: any) {
  await assertTemplatesLoaded(kuma);
  return badges
    .filter(
      ({ status, tag }) =>
        (status && aPage.status?.includes(status)) || page.hasTag(aPage, tag)
    )
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
