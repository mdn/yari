import { BlogPostMetadata } from "./blog.js";
import { ModuleMetaData } from "./curriculum.js";

interface HydrationData<T = any, S = any> {
  hyData?: T;
  doc?: S;
  blogMeta?: BlogPostMetadata | null;
  curriculumMeta?: ModuleMetaData | null;
  pageNotFound?: boolean;
  pageTitle?: any;
  possibleLocales?: any;
  locale?: any;
  noIndexing?: any;
  image?: string | null;
}

export type { HydrationData };
