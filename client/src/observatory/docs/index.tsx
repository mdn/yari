import { useParams, useLocation } from "react-router-dom";
import StaticPage from "../../homepage/static-page";
import "./index.scss";
import { useLocale } from "../../hooks";
import { ObservatoryLayout } from "../layout";
import { OBSERVATORY_TITLE, OBSERVATORY_TITLE_FULL } from "../types";

const ITEMS = [
  {
    slug: "observatory/docs/scoring_methodology",
    title: "Scoring Methodology",
  },
  {
    slug: "observatory/docs/faq",
    title: "FAQ",
  },
  {
    slug: "observatory/docs/scoring_methodology#tests-and-score-modifiers",
    title: "Tests",
  },
];

export function ObservatoryDocsNav({
  heading = OBSERVATORY_TITLE,
}: {
  heading: string;
}) {
  return <RelatedTopics heading={heading} items={ITEMS} />;
}

function RelatedTopics({
  heading,
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
          <h2 className="document-toc-heading">
            <a href="/en-US/observatory">{heading}</a>
          </h2>
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
  const { pathname } = useLocation();
  const locale = useLocale();
  const { "*": slug } = useParams();

  const sidebarHeader = <ObservatoryDocsNav heading={OBSERVATORY_TITLE} />;

  const fullSlug = `observatory/docs/${slug}`;

  return (
    <ObservatoryLayout
      parents={[
        {
          title:
            ITEMS.find((i) => i.slug === fullSlug)?.title ?? "Documentation",
          uri: pathname,
        },
      ]}
    >
      <StaticPage
        {...{
          extraClasses: "plus-docs",
          locale,
          slug: fullSlug,
          title: OBSERVATORY_TITLE_FULL,
          sidebarHeader,
          fallbackData: props.hyData ? props : undefined,
        }}
      />
    </ObservatoryLayout>
  );
}

export default ObservatoryDocs;
