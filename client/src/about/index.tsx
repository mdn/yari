import { HydrationData } from "../../../libs/types/hydration";
import { useEffect, useState } from "react";
import { ProseSection } from "../../../libs/types/document";
import useSWR from "swr";
import { HTTPError } from "../document";
import { WRITER_MODE } from "../env";
import { Prose } from "../document/ingredients/prose";

import "./index.scss";
import "./custom-elements";

export interface AboutSection extends ProseSection {
  H3s?: AboutSection[];
}

export interface AboutDoc {
  title: string;
  sections: AboutSection[];
}

export function About(appProps: HydrationData<any, AboutDoc>) {
  const doc = useAboutDoc(appProps);

  return (
    <main className="about-container">
      <RenderAboutBody
        doc={doc}
        renderer={(section, i) => {
          if (i === 0) {
            return <Header section={section} key={section.value.id} />;
          } else if (section.H3s) {
            return <Tabs section={section} key={section.value.id} />;
          }
          return null;
        }}
      />
    </main>
  );
}

export function useAboutDoc(
  appProps?: HydrationData<any, AboutDoc>
): AboutDoc | undefined {
  const { data } = useSWR<AboutDoc>(
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

      return (await response.json())?.hyData;
    },
    {
      fallbackData: appProps?.hyData,
      revalidateOnFocus: WRITER_MODE,
      revalidateOnMount: true,
    }
  );
  const doc: AboutDoc | undefined = data || appProps?.hyData || undefined;
  return doc;
}

function RenderAboutBody({
  doc,
  renderer = () => null,
}: {
  doc?: AboutDoc;
  renderer?: (section: AboutSection, i: number) => null | JSX.Element;
}) {
  const sections = Array.from(doc?.sections || []).reduce<AboutSection[]>(
    (acc, curr) => {
      if (curr.value.isH3) {
        const prev = acc.at(-1);
        if (prev) {
          prev.H3s ? prev.H3s.push(curr) : (prev.H3s = [curr]);
        }
      } else {
        acc.push(Object.assign({}, curr));
      }
      return acc;
    },
    []
  );
  return sections.map((section, i) => {
    return (
      renderer(section, i) || (
        <Prose key={section.value.id} section={section.value} />
      )
    );
  });
}

export function Header({ section }: { section: AboutSection }) {
  return section.value.content ? (
    <header>
      <section
        dangerouslySetInnerHTML={{ __html: section.value.content }}
      ></section>
    </header>
  ) : null;
}

function Tabs({ section }: { section: AboutSection }) {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const hash = document.location.hash.startsWith("#our_team")
      ? "#our_team"
      : document.location.hash.startsWith("#our_partners")
        ? "#our_partners"
        : document.location.hash;
    const tab = section.H3s?.findIndex(({ value }) => `#${value.id}` === hash);
    if (tab && tab > 0) {
      setActiveTab(tab);
    }
  }, [section.H3s]);

  return (
    section.value.id &&
    section.value.content && (
      <section aria-labelledby={section.value.id}>
        <h2 id={section.value.id}>{section.value.title}</h2>
        <div
          className="section-content"
          dangerouslySetInnerHTML={{ __html: section.value.content }}
        />
        {section.H3s && (
          <div className="tabs">
            <div className="tablist-wrapper">
              <div className="tablist" role="tablist">
                {section.H3s?.map(
                  ({ value }, i) =>
                    value.id &&
                    value.content && (
                      <a
                        id={`${value.id}-tab`}
                        href={`#${value.id}`}
                        className={i === activeTab ? "active" : ""}
                        role="tab"
                        aria-selected="false"
                        aria-controls={`${value.id}-panel`}
                        onClick={() => setActiveTab(i)}
                      >
                        {value.title}
                      </a>
                    )
                )}
              </div>
            </div>
            {section.H3s?.map(
              ({ value }, i) =>
                value.id &&
                value.content && (
                  <div
                    id={`${value.id}-panel`}
                    className={`tabpanel ${i === activeTab ? "active" : ""}`}
                    role="tabpanel"
                    tabIndex={0}
                    dangerouslySetInnerHTML={{ __html: value.content }}
                  />
                )
            )}
          </div>
        )}
      </section>
    )
  );
}
