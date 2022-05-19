import "./index.scss";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './homepage-hero'. Did you mean... Remove this comment to see the full error message
import { HomepageHero } from "./homepage-hero";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './featured-articles'. Did you ... Remove this comment to see the full error message
import FeaturedArticles from "./featured-articles";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './latest-news'. Did you mean t... Remove this comment to see the full error message
import { LatestNews } from "./latest-news";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './recent-contributions'. Did y... Remove this comment to see the full error message
import RecentContributions from "./recent-contributions";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module './contributor-spotlight'. Did ... Remove this comment to see the full error message
import { ContributorSpotlight } from "./contributor-spotlight";

export function Homepage(props) {
  return (
    <main id="content" role="main">
      <div className="homepage mdn-ui-body-m">
        <HomepageHero />
        <FeaturedArticles {...props} />
        <LatestNews {...props} />
        <RecentContributions {...props} />
        <ContributorSpotlight {...props} />
      </div>
    </main>
  );
}
