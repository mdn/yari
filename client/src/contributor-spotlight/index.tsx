import * as React from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";

import { CRUD_MODE } from "../constants";
import { HydrationData } from "../types/hydration";
import { GetInvolved } from "../ui/molecules/get_involved";

import "./index.scss";

type ContributorDetails = {
  body: string;
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
  const { "*": slug, locale } = useParams();
  const baseURL = `/${locale.toLowerCase()}/community/spotlight/${slug}`;
  const contributorJSONUrl = `${baseURL}/index.json`;

  const { data: { hyData } = {} } = useSWR<any>(
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
      initialData: props.hyData ? props : undefined,
      revalidateOnFocus: CRUD_MODE,
    }
  );

  React.useEffect(() => {
    const pageTitle =
      hyData &&
      `Contributor Spotlight - ${hyData.contributorName} - MDN Web Docs`;
    document.title = pageTitle;
  }, [hyData]);

  return (
    <>
      <main className="contributor-spotlight-content-container">
        {hyData && (
          <>
            <h1 className="mify">Contributor profile</h1>
            <p className="profile-header">
              <img
                className="profile-image"
                src={`${baseURL}/${hyData.profileImg}`}
                alt={hyData.profileImgAlt}
              />

              <h2>{hyData.contributorName}</h2>
              <a href={`https://github.com/${hyData.usernames.github}`}>
                @{hyData.usernames.github}
              </a>
            </p>
            <div dangerouslySetInnerHTML={{ __html: hyData.body }} />
          </>
        )}
      </main>
      <GetInvolved />
    </>
  );
}
