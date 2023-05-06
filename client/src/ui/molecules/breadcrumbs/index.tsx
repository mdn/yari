import { DocParent } from "../../../../../libs/types/document";
import { PreloadingDocumentLink } from "../../../document/preloading";
import { BREADCRUMB_CLICK } from "../../../telemetry/constants";
import { useGleanClick } from "../../../telemetry/glean-context";

import "./index.scss";

export const Breadcrumbs = ({ parents }: { parents: DocParent[] }) => {
  if (!parents.length) {
    throw new Error("Empty parents array");
  }

  const gleanClick = useGleanClick();

  return (
    <nav className="breadcrumbs-container" aria-label="Breadcrumb">
      <ol
        typeof="BreadcrumbList"
        vocab="https://schema.org/"
        aria-label="breadcrumbs"
      >
        {parents.map((parent, i) => {
          const currentCrumb = i + 1;
          const isLast = currentCrumb === parents.length;

          return (
            <li key={parent.uri} property="itemListElement" typeof="ListItem">
              <PreloadingDocumentLink
                to={parent.uri}
                className={isLast ? "breadcrumb-current-page" : "breadcrumb"}
                property="item"
                typeof="WebPage"
                // 1/* => current, 2/* = parent, ..., n/n = top-level.
                onClick={() =>
                  gleanClick(
                    `${BREADCRUMB_CLICK}: ${parents.length - i}/${
                      parents.length
                    }`
                  )
                }
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
};
