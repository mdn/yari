import "./index.scss";
import { Search } from "../../ui/molecules/search";
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
          Evolving learning platform for Web technologies and the software that
          powers the Web, including CSS, HTML, and JavaScript. Since 2005.
        </p>
        <Search />
      </section>
      <Mandala extraClasses="homepage-hero-bg" />
    </div>
  );
}
