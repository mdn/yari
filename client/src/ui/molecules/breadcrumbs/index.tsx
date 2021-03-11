import { DocParent } from "../../../document/types";
import { PreloadingDocumentLink } from "../../../document/preloading";

import "./index.scss";

export function Breadcrumbs({ parents }: { parents: DocParent[] }) {
  if (!parents.length) {
    throw new Error("Empty parents array");
  }

  return (
    <nav className="breadcrumbs-container" aria-label="Breadcrumb navigation">
      <ol
        typeof="BreadcrumbList"
        vocab="https://schema.org/"
        aria-label="breadcrumbs"
      >
        {parents.map((parent, i) => {
          const currentCrumb = i + 1;
          const isLast = currentCrumb === parents.length;
          const isPenultimate = currentCrumb === parents.length - 1;

          return (
            <li key={parent.uri} property="itemListElement" typeof="ListItem">
              <PreloadingDocumentLink
                to={parent.uri}
                className={
                  isLast
                    ? "breadcrumb-current-page"
                    : isPenultimate
                    ? "breadcrumb-penultimate"
                    : "breadcrumb"
                }
                property="item"
                typeof="WebPage"
              >
                <span property="name">{parent.title}</span>
              </PreloadingDocumentLink>
              <meta property="position" content={`${currentCrumb}`} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
