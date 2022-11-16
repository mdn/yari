import * as BCD from "@mdn/browser-compat-data/types";

export interface Source {
  folder: string;
  github_url: string;
  last_commit_url: string;
  filename: string;
}

export interface GenericFlaw {
  id: string;
  explanation?: string;
  suggestion: string | null;
  fixable?: boolean;
  fixed?: true;
  externalImage?: boolean;
  name?: string;
}

export interface BrokenLink extends GenericFlaw {
  href: string;
  line: number;
  column: number;
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

export interface ImageWidthFlaw extends GenericFlaw {
  style: string;
  line: number;
  column: number;
}

export interface BadBCDQueryFlaw extends GenericFlaw {}

export interface SectioningFlaw extends GenericFlaw {}

enum BadPreTagType {
  PreWithHTML = "pre_with_html",
}

export interface BadPreTagFlaw extends GenericFlaw {
  html: string;
  line?: number;
  column?: number;
  type: BadPreTagType;
}

export interface HeadingLinksFlaw extends GenericFlaw {
  html: string;
  before: string | null;
  line: number | null;
  column: number | null;
}

export interface UnsafeHTMLFlaw extends GenericFlaw {
  html: string;
  line: number | null;
  column: number | null;
}

export interface RedirectInfo {
  current: string;
  suggested: string;
}

export interface MacroErrorMessage extends GenericFlaw {
  name: string;
  error: {
    path?: string;
    message?: string;
  };
  errorStack: string;
  explanation: string;
  line: number;
  column: number;
  filepath: string;
  sourceContext: string;
  macroSource: string;
  macroName: string;
  fixed?: true;
  redirectInfo?: RedirectInfo;
}

export interface TranslationDifferenceFlaw extends GenericFlaw {
  difference: {
    explanation: string;
    type: string;
    name: string;
    explanationNotes: string[];
  };
}

export type Flaws = Partial<{
  broken_links: BrokenLink[];
  macros: MacroErrorMessage[];
  bad_bcd_queries: BadBCDQueryFlaw[];
  bad_bcd_links: BadBCDLinkFlaw[];
  images: ImageReferenceFlaw[];
  bad_pre_tags: BadPreTagFlaw[];
  sectioning: SectioningFlaw[];
  image_widths: ImageWidthFlaw[];
  heading_links: HeadingLinksFlaw[];
  translation_differences: TranslationDifferenceFlaw[];
  unsafe_html: UnsafeHTMLFlaw[];
}>;

export type Translation = {
  locale: string;
  native: string;
  title: string;
};

export type DocParent = {
  uri: string;
  title: string;
};

export type Toc = {
  id: string;
  text: string;
  sub?: boolean;
};

export interface DocMetadata {
  title: string;
  locale: string;
  native: string;
  pageTitle: string;
  mdn_url: string;
  related_content: any[];
  modified: string;
  flaws: Flaws;
  other_translations?: Translation[];
  translation_of?: string;
  parents?: DocParent[];
  source: Source;
  contributors: string[];
  isTranslated: boolean;
  isActive: boolean;
  hasMathML?: boolean;
  isMarkdown: boolean;
  summary: string;
  popularity?: number; // Used for search.
  noIndexing?: boolean;
  browserCompat?: string[];
  hash?: string;
}

export interface Doc extends DocMetadata {
  sidebarHTML: string;
  toc: Toc[];
  body: Section[];
}

export interface DocFrontmatter {
  contributor_name?: string;
  folder_name?: string;
  is_featured?: boolean;
  img_alt?: string;
  usernames?: any;
  quote?: any;
  title?: string;
  slug?: string;
  original_slug?: string;
}

export type Section = ProseSection | SpecificationsSection | BCDSection;

export interface ProseSection {
  type: "prose";
  value: {
    id: string | null;
    title: string | null;
    isH3: boolean;
    content?: string;
    titleAsText?: string;
  };
}
export interface SpecificationsSection {
  type: "specifications";
  value: {
    id: string;
    title: string;
    isH3: boolean;
    query: string;
    specifications: {
      bcdSpecificationURL: any;
      title: string;
    }[];
  };
}

export interface BCDSection {
  type: "browser_compatibility";
  value: {
    id: string;
    title: string;
    isH3: boolean;
    data?: BCD.Identifier | null;
    dataURL?: string;
    query: string;
    browsers?: BCD.Browsers | null;
  };
}

export type FrequentlyViewedEntry = {
  serial: number;
  url: string;
  title: string;
  timestamp: number;
  visitCount: number;
  parents?: DocParent[];
};

// Yari builder will attach extra keys from the compat data
// it gets from @mdn/browser-compat-data. These are "Yari'esque"
// extras that helps us avoiding to have a separate data structure.
export interface CompatStatementExtended extends BCD.CompatStatement {
  // When a compat statement has a .mdn_url but it's actually not a good
  // one, the Yari builder will attach an extra boolean that indicates
  // that it's not a valid link.
  // Note, it's only 'true' if it's present, hence this interface definition.
  bad_url?: true;
}
