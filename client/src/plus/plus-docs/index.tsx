import { useParams, useLocation } from "react-router-dom";
import { MDN_PLUS_TITLE } from "../../constants";
import StaticPage from "../../homepage/static-page";
import { useUserData } from "../../user-context";
import "./index.scss";

function PlusDocsNav() {
  const userData = useUserData();
  return (
    <RelatedTopics
      heading="MDN Plus"
      items={[
        {
          slug: "plus/docs/features/overview",
          title: "Overview",
        },
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
        ...(!userData?.isAuthenticated
          ? [
              {
                slug: "plus#subscribe",
                title: "Try MDN Plus",
              },
            ]
          : []),
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
        fallbackData: props.hyData ? props : undefined,
      }}
    />
  );
}

export default PlusDocs;
