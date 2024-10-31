import "./index.scss";
import { Search } from "../../ui/molecules/search";
import Mandala from "../../ui/molecules/mandala";
import { useLocale } from "../../hooks";
import { HOMEPAGE_HERO } from "../../telemetry/constants";
import { DocumentSurvey } from "../../ui/molecules/document-survey";
import { useLocation } from "react-router";

export function HomepageHero() {
  const { pathname } = useLocation();
  const locale = useLocale();
  return (
    <div className="homepage-hero dark">
      <section>
        <DocumentSurvey doc={{ mdn_url: pathname }} />
        <h1>
          Resources for <u>Developers</u>,
          <br /> by Developers
        </h1>
        <p>
          Documenting web technologies, including{" "}
          <a
            href={`/${locale}/docs/Web/CSS`}
            data-glean={`${HOMEPAGE_HERO}: css`}
          >
            CSS
          </a>
          ,{" "}
          <a
            href={`/${locale}/docs/Web/HTML`}
            data-glean={`${HOMEPAGE_HERO}: html`}
          >
            HTML
          </a>
          , and{" "}
          <a
            href={`/${locale}/docs/Web/JavaScript`}
            data-glean={`${HOMEPAGE_HERO}: js`}
          >
            JavaScript
          </a>
          , since 2005.
        </p>
        <Search id="hp-search" isHomepageSearch={true} />
      </section>
      <Mandala extraClasses="homepage-hero-bg" />
    </div>
  );
}
