import "./index.scss";
import { Search } from "../ui/molecules/search";
import Mandala from "./mandala";

export function Homepage() {
  return (
    <main id="content" role="main">
      <div className="homepage">
        <div className="homepage-hero">
          <header>
            <h1>
              Your blueprint
              <br /> for a better web.
            </h1>
            <p>
              Evolving learning platform for Web technologies and the software
              that powers the Web, including CSS, HTML, and JavaScript. Since
              2005.
            </p>
            <Search />
          </header>
          <div className="homepage-hero-bg">
            <Mandala />
          </div>
        </div>
      </div>
    </main>
  );
}
