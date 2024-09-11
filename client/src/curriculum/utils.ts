import { useEffect } from "react";
import { CurriculumDoc, CurriculumData } from "../../../libs/types/curriculum";
import useSWR from "swr";
import { HTTPError } from "../document";
import { WRITER_MODE } from "../env";
import { CURRICULUM_TITLE } from "../../../libs/constants";

// Using this import fails the build...
// Therefore we're copying until further investigation.
// import { Topic } from "../../../libs/types/curriculum";
export enum Topic {
  WebStandards = "Web Standards & Semantics",
  Styling = "Styling",
  Scripting = "Scripting",
  BestPractices = "Best Practices",
  Tooling = "Tooling",
  None = "",
}
export enum Template {
  Module = "module",
  Overview = "overview",
  Landing = "landing",
  About = "about",
  Default = "default",
}

export function topic2css(topic?: Topic) {
  switch (topic) {
    case Topic.WebStandards:
      return "standards";
    case Topic.Styling:
      return "styling";
    case Topic.Scripting:
      return "scripting";
    case Topic.Tooling:
      return "tooling";
    case Topic.BestPractices:
      return "practices";
    default:
      return "none";
  }
}

export function useDocTitle(doc?: CurriculumDoc) {
  useEffect(() => {
    if (!doc) {
      return;
    }
    document.title =
      doc.title && doc.title !== CURRICULUM_TITLE
        ? `${doc.title} | ${CURRICULUM_TITLE}`
        : CURRICULUM_TITLE;
  }, [doc]);
}

export function useCurriculumDoc(
  appProps?: CurriculumData
): CurriculumDoc | undefined {
  const dataURL = `./index.json`;
  const { data } = useSWR<CurriculumDoc>(
    dataURL,
    async (url) => {
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
      revalidateOnMount: !appProps?.doc?.template,
    }
  );
  const doc: CurriculumDoc | undefined = data || appProps?.doc || undefined;
  return doc;
}
