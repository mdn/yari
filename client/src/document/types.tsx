export interface Source {
  github_url: string;
  folder: string;
}

export interface Link {
  href: string;
  line: number;
  column: number;
  suggestion: string | null;
  fixed?: true;
}

export interface BadBCDLink {
  slug: string;
  suggestion: string | null;
  query: string | null;
  key: string;
}

type Flaws = {
  broken_links: Link[];
  macros: MacroErrorMessage[];
  bad_bcd_queries: string[];
  bad_bcd_links: BadBCDLink[];
};

export type Translations = { locale: string; slug: string }[];

export type DocParent = {
  uri: string;
  title: string;
};

export type Toc = {
  id: string;
  text: string;
};

export interface Doc {
  title: string;
  mdn_url: string;
  sidebarHTML: string;
  toc: Toc[];
  body: string;
  modified: string;
  flaws: Flaws;
  other_translations?: Translations;
  translation_of?: string;
  parents?: DocParent[];
  source: Source;
  contributors: string[];
  isArchive: boolean;
}

export interface MacroErrorMessage {
  name: string;
  error: {
    path?: string;
  };
  errorMessage: string;
  line: number;
  column: number;
  filepath: string;
  sourceContext: string;
  macroName: string;
  fixed?: true;
}
