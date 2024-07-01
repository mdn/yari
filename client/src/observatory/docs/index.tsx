import { useParams, useLocation } from "react-router-dom";
import StaticPage, { StaticPageProps } from "../../homepage/static-page";
import "./index.scss";
import { useLocale } from "../../hooks";
import { ObservatoryLayout } from "../layout";
import {
  OBSERVATORY_TITLE,
  OBSERVATORY_TITLE_FULL,
} from "../../../../libs/constants";
import useSWR from "swr";
import { OBSERVATORY_API_URL } from "../../env";
import { Loading } from "../../ui/atoms/loading";

export const ITEMS = [
  {
    slug: "observatory/docs/tests_and_scoring",
    title: "Tests & Scoring",
  },
  {
    slug: "observatory/docs/faq",
    title: "FAQ",
  },
];

export function ObservatoryDocsNav() {
  return <RelatedTopics items={ITEMS} />;
}

function RelatedTopics({
  items,
}: {
  items: { slug: string; title: string }[];
}) {
  const locale = useLocale();
  const { pathname: locationPathname } = useLocation();

  return (
    <aside className="document-toc-container">
      <section className="document-toc">
        <header>
          <h2 className="document-toc-heading">{OBSERVATORY_TITLE}</h2>
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

interface ObservatoryMatrixResultEntry {
  name: string;
  scoreModifier: number;
  description: { __html: string };
  recommendation: { __html: string };
}

interface ObservatoryMatrixEntry {
  name: string;
  title: string;
  mdnLink: string;
  results: ObservatoryMatrixResultEntry[];
}

function ObservatoryMatrix({
  data,
}: {
  data?: ObservatoryMatrixEntry[] | null;
}) {
  return (
    <>
      {data &&
        data?.map((entry) => {
          return (
            <section>
              <h2 id={entry.name}>{entry.title}</h2>
              <p>
                See <a href={entry.mdnLink}>{entry.title}</a> for guidance.
              </p>
              <figure className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Test result</th>
                      <th>Description</th>
                      <th align="center">Modifier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.results.map((result) => {
                      return (
                        <tr>
                          <td>{result.name}</td>
                          <td
                            dangerouslySetInnerHTML={
                              result.description as { __html: string }
                            }
                          ></td>
                          <td>{result.scoreModifier}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </figure>
            </section>
          );
        })}
    </>
  );
}

function TestAndScoringPage({ ...props }: StaticPageProps) {
  const { "*": slug } = useParams();

  const { data, isLoading } = useSWR<null | ObservatoryMatrixEntry[]>(
    `${OBSERVATORY_API_URL}/api/v2/recommendation_matrix`,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      let data = await response.json();
      data.map((entry) =>
        entry.results.map((result) => {
          result.description = { __html: result.description };
          result.recommendation = { __html: result.recommendation };
          return result;
        })
      );
      return data;
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  );

  let additionalToc = data?.map((entry) => ({
    text: entry.title,
    id: entry.name,
  }));

  return isLoading ? (
    <Loading message="loading data"></Loading>
  ) : (
    <StaticPage {...props} additionalToc={additionalToc}>
      {slug === "tests_and_scoring" && (
        <>
          <ObservatoryMatrix data={data} />
        </>
      )}{" "}
    </StaticPage>
  );
}

function GenericDoc({ ...props }: StaticPageProps) {
  return <StaticPage {...props} />;
}

function ObservatoryDocs({ ...props }) {
  const { pathname } = useLocation();
  const locale = useLocale();
  const { "*": slug } = useParams();

  const sidebarHeader = <ObservatoryDocsNav />;

  const fullSlug = `observatory/docs/${slug}`;

  const staticPageProps = {
    extraClasses: "plus-docs",
    locale,
    slug: fullSlug,
    title: OBSERVATORY_TITLE_FULL,
    sidebarHeader,
    fallbackData: props.hyData ? props : undefined,
  };

  return (
    <ObservatoryLayout
      parents={[
        {
          title:
            ITEMS.find((i) => i.slug === fullSlug)?.title ?? "Documentation",
          uri: pathname,
        },
      ]}
      withSidebar={true}
    >
      {slug === "tests_and_scoring" ? (
        <TestAndScoringPage {...staticPageProps} />
      ) : (
        <GenericDoc {...staticPageProps} />
      )}
    </ObservatoryLayout>
  );
}

export default ObservatoryDocs;
