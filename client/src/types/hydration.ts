import { DocParent, NewsItem } from "../../../libs/types/document.js";
import { StaticPageDoc } from "../homepage/static-page/index.js";

export type HydrationType = ContributorDetails | StaticPageData | StaticPageDoc;

export interface HydrationData<T extends HydrationType> {
  hyData?: T;
}
export interface ContributorDetails {
  sections: string[];
  contributorName: string;
  folderName: string;
  isFeatured: boolean;
  profileImg: string;
  profileImgAlt: string;
  usernames: Record<string, string>;
  quote: string;
}

export function isContributorDetails(
  hyData: HydrationType | undefined
): hyData is ContributorDetails {
  return !!hyData?.["contributorName"];
}

export interface StaticPageData {
  recentContributions: RecentContributors;
  featuredContributor: FeaturedContributor;
  latestNews: LatestNews;
  featuredArticles: FeaturedArticle[];
}

export function isStaticPageData(
  hyData: HydrationType | undefined,
  property: Exclude<
    keyof StaticPageData,
    keyof ContributorDetails | keyof StaticPageDoc
  > // Exclude is just for protection, in case any name collision is introduced
): hyData is StaticPageData {
  return !!hyData?.[property];
}

export interface RecentContributors {
  items: RecentContributor[];
}

export interface RecentContributor {
  number: number;
  title: string;
  updated_at: string;
  url: string;
  repo: {
    name: string;
    url: string;
  };
}

export interface FeaturedContributor {
  contributorName: string;
  url: string;
  quote: string;
}

export interface LatestNews {
  items: NewsItem[];
}

export interface FeaturedArticle {
  mdn_url: string;
  summary: string;
  title: string;
  tag?: DocParent | null;
}
