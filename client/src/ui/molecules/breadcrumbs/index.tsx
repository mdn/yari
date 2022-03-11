import { Doc } from "../../../document/types";
import { PreloadingDocumentLink } from "../../../document/preloading";

import "./index.scss";

export const Breadcrumbs = ({ doc }: { doc: Doc }) => {
  const items = doc.parents || [
    {
      uri: doc.mdn_url,
      title: doc.title,
    },
  ];

  return (
    <nav className="breadcrumbs-container" aria-label="Breadcrumb navigation">
      <ol
        typeof="BreadcrumbList"
        vocab="https://schema.org/"
        aria-label="breadcrumbs"
      >
        {items.map((item, i) => {
          const currentCrumb = i + 1;
          const isLast = currentCrumb === items.length;

          return (
            <li key={item.uri} property="itemListElement" typeof="ListItem">
              <PreloadingDocumentLink
                to={item.uri}
                className={isLast ? "breadcrumb-current-page" : "breadcrumb"}
                property="item"
                typeof="WebPage"
              >
                <span property="name">{item.title}</span>
              </PreloadingDocumentLink>
              <meta property="position" content={`${currentCrumb}`} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
