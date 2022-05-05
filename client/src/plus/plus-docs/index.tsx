import { Link, useParams, useLocation } from "react-router-dom";
import { MDN_PLUS_TITLE } from "../../constants";
import StaticPage from "../../homepage/static-page";
import "./index.scss";

function PlusDocsNav() {
  return (
    <RelatedTopics
      heading="MDN Plus"
      items={[
        {
          slug: "plus/docs/features/notifications",
          title: "Notifications",
        },
        {
          slug: "plus/docs/features/collections",
          title: "Collections",
        },
        {
          slug: "plus/docs/features/offline",
          title: "MDN Offline",
        },
        {
          slug: "plus/docs/faq",
          title: "Frequently asked questions",
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
  const { locale = "en-US" } = useParams();
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
                <Link
                  className="document-toc-link"
                  aria-current={
                    itemPathname.toLowerCase() ===
                    locationPathname.toLowerCase()
                  }
                  to={itemPathname}
                >
                  {title}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}

function PlusDocs({ ...props }) {
  const { locale = "en-US", "*": slug } = useParams();

  return (
    <StaticPage
      {...{
        extraClasses: "plus-docs",
        locale,
        slug: `plus/docs/${slug}`,
        title: MDN_PLUS_TITLE,
        parents: [{ uri: `/${locale}/plus`, title: MDN_PLUS_TITLE }],
        sidebarHeader: <PlusDocsNav />,
        initialData: props.hyData ? props : undefined,
      }}
    />
  );
}

export default PlusDocs;
