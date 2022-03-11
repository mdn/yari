import "./index.scss";
import { HomepageHero } from "./homepage-hero";
import { FeaturedArticles } from "./featured-articles";
import RecentContributions from "./recent-contributions";
import { ContributorSpotlight } from "./contributor-spotlight";

export function Homepage(props) {
  return (
    <main id="content" role="main">
      <div className="homepage mdn-ui-body-m">
        <HomepageHero />
        <FeaturedArticles />
        <RecentContributions {...props} />
        <ContributorSpotlight {...props} />
      </div>
    </main>
  );
}
