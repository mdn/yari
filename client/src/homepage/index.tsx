import "./index.scss";
import { HomepageHero } from "./homepage-hero";
import { FeaturedArticles } from "./featured-articles";
import { LatestNews } from "./latest-news";
import RecentContributions from "./recent-contributions";
import { ContributorSpotlight } from "./contributor-spotlight";

export function Homepage(props) {
  return (
    <main id="content" role="main">
      <div className="homepage mdn-ui-body-m">
        <HomepageHero />
        <FeaturedArticles />
        <LatestNews {...props} />
        <RecentContributions {...props} />
        <ContributorSpotlight {...props} />
      </div>
    </main>
  );
}
