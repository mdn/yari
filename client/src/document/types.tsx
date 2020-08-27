export interface Source {
  github_url: string;
  folder: string;
}

export interface GenericFlaw {
  id: string;
  explanation: string;
  suggestion: string | null;
  fixable?: boolean;
  fixed?: true;
}

export interface BrokenLink extends GenericFlaw {
  href: string;
  line: number;
  column: number;
  suggestion: string | null;
}

export interface BadBCDLinkFlaw extends GenericFlaw {
  slug: string;
  query: string | null;
  key: string;
}

export interface ImageReferenceFlaw extends GenericFlaw {
  src: string;
  line: number;
  column: number;
}

export interface BadBCDQueryFlaw extends GenericFlaw {}

export interface MacroErrorMessage extends GenericFlaw {
  name: string;
  error: {
    path?: string;
  };
  errorStack: string;
  line: number;
  column: number;
  filepath: string;
  sourceContext: string;
  macroSource: string;
  macroName: string;
  fixed?: true;
}

type Flaws = {
  broken_links: BrokenLink[];
  macros: MacroErrorMessage[];
  bad_bcd_queries: BadBCDQueryFlaw[];
  bad_bcd_links: BadBCDLinkFlaw[];
  images: ImageReferenceFlaw[];
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
  pageTitle: string;
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
