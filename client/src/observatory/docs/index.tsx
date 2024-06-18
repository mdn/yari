import { useParams, useLocation } from "react-router-dom";
import { MDN_PLUS_TITLE } from "../../constants";
import StaticPage from "../../homepage/static-page";
import "./index.scss";
import { useLocale } from "../../hooks";

function ObservatoryDocsNav() {
  return (
    <RelatedTopics
      heading="HTTP Observatory"
      items={[
        {
          slug: "observatory/docs/scoring",
          title: "Scoring",
        },
        {
          slug: "observatory/docs/faq",
          title: "FAQ",
        },
        {
          slug: "observatory/docs/tests",
          title: "Tests",
        },
      ]}
    />
  );
}

function RelatedTopics({
  heading = "Related Topics",
  items,
}: {
  heading: string;
  items: { slug: string; title: string }[];
}) {
  const locale = useLocale();
  const { pathname: locationPathname } = useLocation();

  return (
    <aside className="document-toc-container">
      <section className="document-toc">
        <header>
          <h2 className="document-toc-heading">{heading}</h2>
        </header>
        <ul className="document-toc-list">
          {items.map(({ slug, title }) => {
            const itemPathname = `/${locale}/${slug}`;

            return (
              <li key={itemPathname} className="document-toc-item">
                <a
                  href={itemPathname}
                  className="document-toc-link"
                  aria-current={
                    itemPathname.toLowerCase() ===
                    locationPathname.toLowerCase()
                  }
                >
                  {title}
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}

function ObservatoryDocs({ ...props }) {
  const locale = useLocale();
  const { "*": slug } = useParams();

  const sidebarHeader = <ObservatoryDocsNav />;

  return (
    <StaticPage
      {...{
        extraClasses: "plus-docs",
        locale,
        slug: `observatory/docs/${slug}`,
        title: MDN_PLUS_TITLE,
        sidebarHeader,
        fallbackData: props.hyData ? props : undefined,
      }}
    />
  );
}

export default ObservatoryDocs;
