import "./index.scss";
import { HydrationData } from "../../../libs/types/hydration";
import { useMemo } from "react";
import useSWRImmutable from "swr/immutable";
import { Section } from "../../../libs/types/document";
import useSWR from "swr";
import { HTTPError } from "../document";
import { WRITER_MODE } from "../env";
import { Prose } from "../document/ingredients/prose";

interface CommunityDoc {
  title: string;
  body: Section[];
}

export function Community(appProps: HydrationData<any, CommunityDoc>) {
  const doc = useCommunityDoc(appProps);
  return (
    <main className="community-container">
      <RenderCommunityBody
        doc={doc}
        renderer={(section, i) => {
          if (i === 0) {
            return (
              <Header
                section={section}
                key={section.value.id}
                h1={doc?.title}
              />
            );
          } else if (section.value.id === "help_us_fix_open_issues") {
            return <Issues section={section} />;
          }
          return null;
        }}
      />
    </main>
  );
}

function useCommunityDoc(
  appProps?: HydrationData<any, CommunityDoc>
): CommunityDoc | undefined {
  const { data } = useSWR<CommunityDoc>(
    "index.json",
    async () => {
      const url = new URL(
        `${window.location.pathname.replace(/\/$/, "")}/index.json`,
        window.location.origin
      ).toString();
      const response = await fetch(url);

      if (!response.ok) {
        switch (response.status) {
          case 404:
            throw new HTTPError(response.status, url, "Page not found");
        }

        const text = await response.text();
        throw new HTTPError(response.status, url, text);
      }

      return (await response.json())?.doc;
    },
    {
      fallbackData: appProps?.doc,
      revalidateOnFocus: WRITER_MODE,
      revalidateOnMount: true,
    }
  );
  const doc: CommunityDoc | undefined = data || appProps?.doc || undefined;
  return doc;
}

function RenderCommunityBody({
  doc,
  renderer = () => null,
}: {
  doc?: CommunityDoc;
  renderer?: (section: Section, i: number) => null | JSX.Element;
}) {
  return doc?.body.map((section, i) => {
    return (
      renderer(section, i) || (
        <Prose key={section.value.id} section={section.value} />
      )
    );
  });
}

function Header({ section, h1 }: { section: any; h1?: string }) {
  const html = useMemo(
    () => ({ __html: section.value?.content }),
    [section.value?.content]
  );
  return (
    <header className="landing-header">
      <section>
        <h1>{h1}</h1>
        <div dangerouslySetInnerHTML={html}></div>
      </section>
    </header>
  );
}

function Issues({ section }: { section: any }) {
  const html = useMemo(
    () => ({ __html: section.value?.content }),
    [section.value?.content]
  );
  const LABELS = ["good first issue", "accepting PR"];
  const { data } = useSWRImmutable(
    `is:open is:issue repo:mdn/content repo:mdn/translated-content repo:mdn/yari label:"good first issue","accepting PR" sort:created-desc no:assignee is:public`,
    async (query) => {
      const url = new URL("https://api.github.com/search/issues");
      url.searchParams.append("per_page", "5");
      url.searchParams.append("q", query);
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    }
  );
  return (
    <section aria-labelledby={section.value.id}>
      <h2 id={section.value.id}>{section.value.title}</h2>
      <div className="section-content" dangerouslySetInnerHTML={html}></div>
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
                    <a href={html_url}>{title}</a>
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
  );
}
