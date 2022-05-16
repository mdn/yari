import React from "react";
import { PageContentContainer } from "../ui/atoms/page-content";
import { Search } from "../ui/molecules/search";
import { useLocale } from "../hooks";
import "./index.scss";

// Lazy sub-components
const ViewedDocuments = React.lazy(() => import("./viewed-documents"));

export default function WritersHomepage() {
  const isServer = typeof window === "undefined";
  const locale = useLocale();

  return (
    <PageContentContainer>
      <div className="container" id="writers-homepage">
        <h2>Writer's home page</h2>

        <Search id="writers-hp" />

        {!isServer && (
          <React.Suspense fallback={null}>
            <ViewedDocuments />
          </React.Suspense>
        )}

        <h3>Sample pages</h3>
        <ul>
          <li>
            <a href="/en-US/docs/MDN/Kitchensink">The Kitchensink (en-US)</a>
          </li>
          <li>
            <a href={`/${locale}/docs/Web/HTML`}>Web/HTML index</a>
            <ul>
              <li>
                <a href={`/${locale}/docs/Web/HTML/Element/video`}>
                  HTML/video
                </a>
              </li>
            </ul>
          </li>

          <li>
            <a href={`/${locale}/docs/Web/API`}>Web/API index</a>
            <ul>
              <li>
                <a href={`/${locale}/docs/Web/API/Fetch_API/Using_Fetch`}>
                  Using Fetch API
                </a>
              </li>
            </ul>
          </li>
          <li>
            <a href={`/${locale}/docs/Web/CSS`}>Web/CSS index</a>
            <ul>
              <li>
                <a href={`/${locale}/docs/Web/CSS/Specificity`}>
                  CSS Specificity
                </a>
              </li>
            </ul>
          </li>
          <li>
            <a href={`/${locale}/docs/Web/JavaScript`}>Web/JavaScript index</a>
            <ul>
              <li>
                <a
                  href={`/${locale}/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach`}
                >
                  Array.prototype.forEach()
                </a>
              </li>
            </ul>
          </li>
          <li>
            <a
              href={`/${locale}/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs`}
            >
              Page with lots of BCD tables
            </a>
          </li>
          <li>
            <a href={`/${locale}/docs/Web/API/Document/#Browser_compatibility`}>
              Largest BCD table
            </a>
          </li>
        </ul>
        <h3>Tools</h3>
        <ul>
          <li>
            <a href={`/${locale}/_translations`}>Translations</a>
          </li>
          <li>
            <a href={`/${locale}/_sitemap`}>Sitemap</a>
          </li>
          <li>
            <a href={`/${locale}/_flaws`}>Flaws Dashboard</a>
          </li>
          <li>
            <a href={`/${locale}/_traits`}>All Documents Traits</a>
          </li>
        </ul>
      </div>
    </PageContentContainer>
  );
}
