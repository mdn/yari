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
  short_title: string;
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
  baseline?: WebFeatureStatus;
  hash?: string;
}

export interface Doc extends DocMetadata {
  sidebarHTML: string;
  sidebarMacro?: string;
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
  translation_of?: string;
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

export interface Specification {
  bcdSpecificationURL: string;
  title: string;
}

export interface SpecificationsSection {
  type: "specifications";
  value: {
    id: string;
    title: string;
    isH3: boolean;
    query: string;
    specifications: Specification[];
  };
}

export interface BCDSection {
  type: "browser_compatibility";
  value: {
    id: string;
    title: string;
    isH3: boolean;
    query: string;
  };
}

export interface NewsItem {
  url: string;
  title: string;
  author?: string;
  source: {
    name: string;
    url: string;
  };
  published_at: string;
}

export interface WebFeature {
  compat_features?: string[];
  status?: WebFeatureStatus;
  spec?: unknown;
}

export interface WebFeatureStatus {
  is_baseline?: boolean;
  since?: string;
  support?: {
    chrome?: string | boolean;
    edge?: string | boolean;
    firefox?: string | boolean;
    safari?: string | boolean;
  };
}
