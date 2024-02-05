// Using this import fails the build...

import { useEffect } from "react";
import { CurriculumDoc, ModuleData } from "../../../libs/types/curriculum";
import { HydrationData } from "../../../libs/types/hydration";
import useSWR from "swr";
import { HTTPError } from "../document";
import { WRITER_MODE } from "../env";

//import { Topic } from "../../../libs/types/curriculum";
export enum Topic {
  WebStandards = "Web Standards & Semantics",
  Styling = "Styling",
  Scripting = "Scripting",
  BestPractices = "Best Practices",
  Tooling = "Tooling",
  None = "",
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

const TITLE_SUFFIX = "MDN Curriculum";
export function useDocTitle(doc?: CurriculumDoc) {
  useEffect(() => {
    if (!doc) {
      return;
    }
    document.title =
      doc.title && doc.title !== TITLE_SUFFIX
        ? `${doc.title} | MDN Curriculum`
        : "MDN Curriculum";
  }, [doc]);
}

export function useCurriculumDoc(appProps: ModuleData) {
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
      fallbackData: appProps?.doc as CurriculumDoc,
      revalidateOnFocus: WRITER_MODE,
      revalidateOnMount: !appProps?.doc?.modified,
    }
  );
  const doc: CurriculumDoc | undefined = data || appProps?.doc || undefined;
  return doc;
}
