import React from "react";
import { Link } from "react-router-dom";
import { MainContentContainer } from "../ui/atoms/page-content";
import { Search } from "../ui/molecules/search";
import Mandala from "../ui/molecules/mandala";
import { useIsServer, useLocale } from "../hooks";
import "./index.scss";

// Lazy sub-components
const ViewedDocuments = React.lazy(() => import("./viewed-documents"));

export default function WritersHomepage() {
  const isServer = useIsServer();
  const locale = useLocale();

  return (
    <MainContentContainer>
      <div id="writers-homepage">
        <div className="homepage-hero dark">
          <section>
            <h1>
              MDN <u>Content Writer</u> Homepage
            </h1>
            <p>
              Welcome, content writer! This is your very own homepage, which
              includes links to various tools, recently viewed documents and
              sample documents.
            </p>
            <Search id="writers-hp-search" isHomepageSearch={true} />
          </section>
          <Mandala extraClasses="homepage-hero-bg" />
        </div>

        <div className="container">
          <h2>Tools</h2>
          <ul id="tools">
            <li>
              <Link to={`/${locale}/_flaws`}>Flaws Dashboard</Link>
            </li>
            <li>
              <Link to={`/${locale}/_sitemap`}>Sitemap</Link>
            </li>
            <li>
              <Link to={`/${locale}/_translations`}>Translations</Link>
            </li>
          </ul>

          <h2>Documents</h2>

          {!isServer && (
            <React.Suspense fallback={null}>
              <ViewedDocuments />
            </React.Suspense>
          )}

          <h3>Sample pages</h3>
          <ul id="sample-pages">
            <li>
              <Link to="/en-US/docs/MDN/Kitchensink">
                The Kitchensink (en-US)
              </Link>
            </li>
            <li>
              <Link to={`/${locale}/docs/Web/HTML`}>Web/HTML index</Link>
              <ul>
                <li>
                  <Link to={`/${locale}/docs/Web/HTML/Element/video`}>
                    HTML/video
                  </Link>
                </li>
              </ul>
            </li>

            <li>
              <Link to={`/${locale}/docs/Web/API`}>Web/API index</Link>
              <ul>
                <li>
                  <Link to={`/${locale}/docs/Web/API/Fetch_API/Using_Fetch`}>
                    Using Fetch API
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link to={`/${locale}/docs/Web/CSS`}>Web/CSS index</Link>
              <ul>
                <li>
                  <Link to={`/${locale}/docs/Web/CSS/Specificity`}>
                    CSS Specificity
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link to={`/${locale}/docs/Web/JavaScript`}>
                Web/JavaScript index
              </Link>
              <ul>
                <li>
                  <Link
                    to={`/${locale}/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach`}
                  >
                    Array.prototype.forEach()
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link
                to={`/${locale}/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs`}
              >
                Page with lots of BCD tables
              </Link>
            </li>
            <li>
              <Link
                to={`/${locale}/docs/Web/API/Document/#Browser_compatibility`}
              >
                Largest BCD table
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </MainContentContainer>
  );
}
