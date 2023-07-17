import "./index.scss";
import { HomepageHero } from "./homepage-hero";
import FeaturedArticles from "./featured-articles";
import { LatestNews } from "./latest-news";
import RecentContributions from "./recent-contributions";
import { ContributorSpotlight } from "./contributor-spotlight";
import { HpFooterPlacement, HpMainPlacement } from "../ui/organisms/placement";

export function Homepage(props) {
  return (
    <main id="content" role="main">
      <div className="homepage mdn-ui-body-m">
        <HomepageHero />
        <HpMainPlacement />
        <FeaturedArticles {...props} />
        <LatestNews {...props} />
        <RecentContributions {...props} />
        <ContributorSpotlight {...props} />
        <HpFooterPlacement />
      </div>
    </main>
  );
}
