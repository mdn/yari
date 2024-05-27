import { BlogPostMetadata } from "./blog.js";

interface HydrationData<T = any, S = any> {
  hyData?: T;
  doc?: S;
  blogMeta?: BlogPostMetadata | null;
  pageNotFound?: boolean;
  pageTitle?: any;
  possibleLocales?: any;
  locale?: any;
  noIndexing?: boolean;
  onlyFollow?: boolean;
  image?: string | null;
}

export type { HydrationData };
