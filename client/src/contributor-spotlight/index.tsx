import * as React from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";

import { CRUD_MODE } from "../constants";
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

export function ContributorSpotlight(props: ContributorDetails) {
  const { "*": slug, locale } = useParams();
  const baseURL = `/${locale.toLowerCase()}/community/spotlight/${slug}`;
  const contributorJSONUrl = `${baseURL}/index.json`;

  const { data } = useSWR<any>(
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
      initialData: props.body ? props : undefined,
      revalidateOnFocus: CRUD_MODE,
    }
  );

  React.useEffect(() => {
    const pageTitle =
      data && `Contributor Spotlight - ${data.contributorName} - MDN Web Docs`;
    document.title = pageTitle;
  }, [data]);

  return (
    <>
      <main className="contributor-spotlight-content-container">
        {data && (
          <>
            <h1 className="mify">Contributor profile</h1>
            <p className="profile-header">
              <img
                className="profile-image"
                src={`${baseURL}/${data.profileImg}`}
                alt={data.profileImgAlt}
              />

              <h2>{data.contributorName}</h2>
              <a href={`https://github.com/${data.usernames.github}`}>
                @{data.usernames.github}
              </a>
            </p>
            <div dangerouslySetInnerHTML={{ __html: data.body }} />
          </>
        )}
      </main>
      <GetInvolved />
    </>
  );
}
