import * as React from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";

import WebLinks from "./web-links";
import { CRUD_MODE } from "../constants";

import "./index.scss";

type ContributorDetails = {
  body: string;
  contributorName: string;
  folderName: string;
  isFeatured: boolean;
  pageTitle: string;
  profileImg: object;
  webLinks: Array<{ name: string; url: string }>;
  quote: string;
};

export function ContributorSpotlight(props: ContributorDetails) {
  const { "*": slug, locale } = useParams();
  const baseURL = `/${locale.toLowerCase()}/contribute/spotlight/${slug}`;
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
    document.title = data && data.pageTitle;
  }, [data]);

  return (
    <main className="contributor-spotlight-content-container">
      {data && (
        <>
          <img
            className="profile-image"
            src={`${baseURL}/${data.profileImg.src}`}
            alt={data.profileImg.alt}
          />
          <h1>Contributor Spotlight - {data.contributorName}</h1>
          <WebLinks webLinks={data.webLinks} />
          <div dangerouslySetInnerHTML={{ __html: data.body }} />
        </>
      )}
    </main>
  );
}
