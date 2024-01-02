import { KumaThis } from "../environment.js";
import page from "../api/page.js";

type Badge = {
  status: string;
  tag: string;
  macro: string;
  template: Map<string, string>;
};

const badges: Array<Badge> = [
  {
    status: "experimental",
    tag: "Experimental",
    macro: "Experimental_Inline",
    template: new Map(),
  },
  {
    status: "non-standard",
    tag: "Non-standard",
    macro: "Non-Standard_Inline",
    template: new Map(),
  },
  {
    status: "deprecated",
    tag: "Deprecated",
    macro: "Deprecated_Inline",
    template: new Map(),
  },
];

const loadedLocales = new Set<string>();

export async function getBadgeTemplates(kuma: KumaThis, aPage: any) {
  const locale = kuma.env.locale.toLocaleLowerCase();
  await assertTemplatesLoaded(kuma, locale);
  return badges
    .filter(
      ({ status, tag }) =>
        aPage.status?.includes(status) || page.hasTag(aPage, tag)
    )
    .map(({ template }) => template.get(locale));
}

async function assertTemplatesLoaded(kuma: KumaThis, locale: string) {
  if (!loadedLocales.has(locale)) {
    await loadBadgeTemplates(kuma, locale);
    loadedLocales.add(locale);
  }
}

async function loadBadgeTemplates(kuma: KumaThis, locale: string) {
  async function loadBadge(badge: Badge) {
    badge.template.set(locale, (await kuma.template(badge.macro)) as string);
  }

  await Promise.all(badges.map(loadBadge));
}
