import { Doc } from "./document.js";

export interface AuthorFrontmatter {
  name?: string;
  link?: string;
  avatar?: string;
}

export interface AuthorMetadata {
  name?: string;
  link?: string;
  avatar_url?: string;
}

export interface BlogImage {
  file: string;
  alt?: string;
  source?: AuthorMetadata;
  creator?: AuthorMetadata;
}

export interface BlogPostFrontmatter {
  slug: string;
  title: string;
  description: string;
  image: BlogImage;
  keywords: string[];
  sponsored?: boolean;
  published?: boolean;
  date: string;
  author?: AuthorFrontmatter | string;
}

export interface BlogPostLimitedMetadata {
  slug: string;
  title: string;
}

export interface BlogPostMetadataLinks {
  previous?: BlogPostLimitedMetadata;
  next?: BlogPostLimitedMetadata;
}

export interface BlogPostMetadata extends BlogPostFrontmatter {
  author?: AuthorMetadata;
  readTime?: number;
  links?: BlogPostMetadataLinks;
}

export interface BlogPostData {
  doc: Doc;
  blogMeta: BlogPostMetadata;
}
