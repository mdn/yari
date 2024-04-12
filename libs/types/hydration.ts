import { BlogPostMetadata } from "./blog.js";

interface HydrationData<T = any, S = any> {
  hyData?: T;
  doc?: S;
  blogMeta?: BlogPostMetadata | null;
  pageNotFound?: boolean;
  pageTitle?: any;
  possibleLocales?: any;
  locale?: any;
  noIndexing?: any;
  image?: string | null;
  url: string;
}

export type { HydrationData };
