import { DocParent } from "../../../libs/types/document";
import { NewsItem } from "../homepage/latest-news";
import { StaticPageDoc } from "../homepage/static-page";

type HydrationType = ContributorDetails | StaticPageData | StaticPageDoc;

export interface HydrationData {
  hyData?: HydrationType;
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
  tag: DocParent | null;
}
