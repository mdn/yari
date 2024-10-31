import "./index.scss";
import { HydrationData } from "../../../libs/types/hydration";
import { useEffect } from "react";
import useSWR, { SWRConfig } from "swr";
import { Prose } from "../document/ingredients/prose";
import { SWRLocalStorageCache } from "../utils";
import { useIsServer } from "../hooks";
import { AboutDoc, AboutSection, Header, useAboutDoc } from "../about";

export function Community(appProps: HydrationData<any, AboutDoc>) {
  const doc = useAboutDoc(appProps);

  useEffect(() => {
    import("./contributor-list");
  }, []);

  return (
    <SWRConfig
      value={{ provider: () => new SWRLocalStorageCache("community") }}
    >
      <main className="community-container">
        <RenderCommunityBody
          doc={doc}
          renderer={(section, i) => {
            if (i === 0) {
              return <Header section={section} key={section.value.id} />;
            } else if (section.value.id === "help_us_fix_open_issues") {
              return <Issues section={section} key={section.value.id} />;
            }
            return null;
          }}
        />
      </main>
    </SWRConfig>
  );
}

function RenderCommunityBody({
  doc,
  renderer = () => null,
}: {
  doc?: AboutDoc;
  renderer?: (section: AboutSection, i: number) => null | JSX.Element;
}) {
  return doc?.sections.map((section, i) => {
    return (
      renderer(section, i) || (
        <Prose key={section.value.id} section={section.value} />
      )
    );
  });
}

function Issues({ section }: { section: AboutSection }) {
  const isServer = useIsServer();
  const LABELS = ["good first issue", "accepting PR"];
  const { data } = useSWR(
    !isServer &&
      `is:open is:issue repo:mdn/content repo:mdn/translated-content repo:mdn/yari label:"good first issue","accepting PR" sort:created-desc no:assignee is:public`,
    async (query) => {
      const url = new URL("https://api.github.com/search/issues");
      url.searchParams.append("per_page", "5");
      url.searchParams.append("q", query);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(res.status.toString());
      }
      return await res.json();
    },
    {
      revalidateOnFocus: false,
    }
  );
  return section.value.id && section.value.content ? (
    <section aria-labelledby={section.value.id}>
      <h2 id={section.value.id}>{section.value.title}</h2>
      <div
        className="section-content"
        dangerouslySetInnerHTML={{ __html: section.value.content }}
      ></div>
      <div className="issues-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Repository</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map(({ html_url, title, labels, repository_url }) => (
              <tr key={html_url}>
                <td>
                  <div>
                    <a href={html_url} target="_blank" rel="noreferrer">
                      {title}
                    </a>
                    {labels.map(({ name }) =>
                      LABELS.includes(name) ? (
                        <span key={name} className="label">
                          {name}
                        </span>
                      ) : null
                    )}
                  </div>
                </td>
                <td>
                  <a
                    href={repository_url.replace(
                      "https://api.github.com/repos/",
                      "https://github.com/"
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {repository_url.replace(
                      "https://api.github.com/repos/",
                      ""
                    )}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  ) : null;
}
