import "./index.scss";
import { Search } from "../../ui/molecules/search";
import Mandala from "../../ui/molecules/mandala";

export function HomepageHero() {
  return (
    <div className="homepage-hero">
      <header>
        <div>
          <h1>
            Resources by developers,
            <br /> for developers.
          </h1>
          <p>
            Evolving learning platform for Web technologies and the software
            that powers the Web, including CSS, HTML, and JavaScript. Since
            2005.
          </p>
        </div>
        <Search />
      </header>
      <div className="homepage-hero-bg">
        <Mandala animate={false} />
      </div>
    </div>
  );
}
