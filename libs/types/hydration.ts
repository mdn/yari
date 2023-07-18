import { BlogPostMetadata } from "./blog.js";

interface HydrationData<T = any> {
  hyData?: T;
  doc?: any;
  blogMeta?: BlogPostMetadata | null;
  pageNotFound?: boolean;
  pageTitle?: any;
  possibleLocales?: any;
  locale?: any;
  noIndexing?: any;
  image?: string | null;
}

export type { HydrationData };
