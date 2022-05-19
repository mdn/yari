import "./index.scss";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/molecules/search'. Di... Remove this comment to see the full error message
import { Search } from "../../ui/molecules/search";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../ui/molecules/mandala'. D... Remove this comment to see the full error message
import Mandala from "../../ui/molecules/mandala";

export function HomepageHero() {
  return (
    <div className="homepage-hero dark">
      <section>
        <h1>
          Resources for <u>Developers</u>,
          <br /> by Developers
        </h1>
        <p>
          Documenting web technologies, including CSS, HTML, and JavaScript,
          since 2005.
        </p>
        <Search id="hp-search" isHomepageSearch={true} />
      </section>
      <Mandala rotate={true} extraClasses="homepage-hero-bg" />
    </div>
  );
}
