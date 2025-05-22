import "./index.scss";
import { Search } from "../../ui/molecules/search";
import Mandala from "../../ui/molecules/mandala";
import { useLocale } from "../../hooks";
import { HOMEPAGE_HERO } from "../../telemetry/constants";

export function HomepageHero() {
  const locale = useLocale();
  return (
    <div className="homepage-hero dark">
      <section>
        <h1>
          Resources for <u>Developers</u>,
          <br /> by Developers
        </h1>
        <p>
          <span>United in love</span>
        </p>
        <Search id="hp-search" isHomepageSearch={true} />
      </section>
      <Mandala pride={true} extraClasses="homepage-hero-bg animate-colors" />
    </div>
  );
}
