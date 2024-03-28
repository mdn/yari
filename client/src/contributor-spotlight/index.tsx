import * as React from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";

import { WRITER_MODE } from "../env";
import { HydrationData } from "../../../libs/types/hydration";
import { GetInvolved } from "../ui/molecules/get_involved";
import { Quote } from "../ui/molecules/quote";

import "./index.scss";
import { useLocale } from "../hooks";
import { PageNotFound } from "../page-not-found";
import { Loading } from "../ui/atoms/loading";

type ContributorDetails = {
  sections: [string];
  contributorName: string;
  folderName: string;
  isFeatured: boolean;
  profileImg: string;
  profileImgAlt: string;
  webLinks: {
    github: string;
  };
  quote: string;
};

export function ContributorSpotlight(props: HydrationData<ContributorDetails>) {
  const locale = useLocale();
  const { "*": slug } = useParams();
  const baseURL = `/${locale.toLowerCase()}/community/spotlight/${slug}`;
  const contributorJSONUrl = `${baseURL}/index.json`;

  const fallbackData = props.hyData ? props : undefined;

  const { error, data: { hyData } = {} } = useSWR<any>(
    contributorJSONUrl,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} on ${url}: ${text}`);
      }
      return await response.json();
    },
    {
      fallbackData,
      revalidateOnFocus: WRITER_MODE,
      revalidateOnMount: !fallbackData,
    }
  );

  React.useEffect(() => {
    const pageTitle =
      hyData &&
      `Contributor Spotlight - ${hyData.contributorName} - MDN Web Docs`;
    document.title = pageTitle;
  }, [hyData]);

  if (error) {
    return <PageNotFound />;
  } else if (!hyData) {
    return <Loading />;
  }

  return (
    <>
      <main className="contributor-spotlight-content-container">
        <h1 className="_ify">Contributor profile</h1>
        <section className="profile-header">
          <img
            className="profile-image"
            src={`${baseURL}/${hyData.profileImg}`}
            alt={hyData.profileImgAlt}
            width="200"
            height="200"
          />
          <a
            className="username"
            href={`https://github.com/${hyData.usernames.github}`}
          >
            @{hyData.usernames.github}
          </a>
        </section>
        <section
          dangerouslySetInnerHTML={{ __html: hyData.sections[0] }}
        ></section>
        <Quote name={hyData.contributorName}>{hyData.quote}</Quote>

        {hyData.sections.slice(1).map((section) => {
          return <section dangerouslySetInnerHTML={{ __html: section }} />;
        })}
      </main>
      <GetInvolved />
    </>
  );
}
