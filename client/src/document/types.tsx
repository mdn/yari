export interface Doc {
  title: string;
  mdn_url: string;
  sidebarHTML: string;
  body: string;
  modified: string;
  flaws: object;
  other_translations?: object[];
  translation_of?: string;
  parents?: Doc[];
  source: object;
  contributors: string[];
}
