import useSWR from "swr";

import { CRUD_MODE } from "../constants";
import { BlogFeed } from "../ui/molecules/blog-feed";
import { Contribute } from "../ui/molecules/home-contribute";
import { HomeHero } from "../ui/molecules/home-hero";

import "./index.scss";

import { FeedEntry } from "./types";

interface HomepageData {
  feedEntries: FeedEntry[];
}

export function Homepage(props /* TODO: define a TS interface for this */) {
  const { data, error } = useSWR<HomepageData>(
    "./index.json",
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} on ${url}: ${text}`);
      }
      return await response.json();
    },
    {
      initialData: props.feedEntries
        ? { feedEntries: props.feedEntries }
        : undefined,
      revalidateOnFocus: CRUD_MODE,
    }
  );

  return (
    <main id="content" role="main">
      <HomeHero />
      <div className="home-content-container">
        {error ? (
          <p>
            Error downloading feed entries (<code>{error.toString()}</code>)
          </p>
        ) : (
          <BlogFeed feedEntries={data && data.feedEntries} />
        )}
        <Contribute />
      </div>
    </main>
  );
}
