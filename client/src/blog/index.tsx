import useSWR from "swr";

import { HTTPError } from "../document";
import { WRITER_MODE } from "../env";

import { Route, Routes } from "react-router-dom";
import { HydrationData } from "../../../libs/types/hydration";
import { BlogPost, AuthorDateReadTime } from "./post";
import { BlogImage, BlogPostMetadata } from "../../../libs/types/blog.js";

import "./index.scss";
import { Button } from "../ui/atoms/button";
import { SignUpSection as NewsletterSignUp } from "../newsletter";
import { BlogFeedIcon } from "./icon";

interface BlogIndexData {
  posts: BlogPostMetadata[];
}

export function Blog(appProps: HydrationData) {
  return (
    <Routes>
      <Route path="/" element={<BlogIndex {...appProps} />} />
      <Route path="/:slug/" element={<BlogPost {...appProps} />} />
    </Routes>
  );
}
export function BlogIndexImageFigure({
  image,
  slug,
  width,
  height,
}: {
  image: BlogImage;
  slug: string;
  width?: number;
  height?: number;
}) {
  const src = `./${slug}/${image.file}`;
  return (
    <figure className="blog-image">
      <a href={`./${slug}/`}>
        <img alt={image.alt || ""} src={src} height={height} width={width} />
      </a>
    </figure>
  );
}

function PostPreview({ fm }: { fm: BlogPostMetadata }) {
  return (
    <article>
      <header>
        <BlogIndexImageFigure image={fm.image} height={200} slug={fm.slug} />
        <h2>
          <a href={`./${fm.slug}/`}>{fm.title}</a>
        </h2>
        <AuthorDateReadTime metadata={fm} />
      </header>
      <p>{fm.description}</p>
      <footer>
        {fm.sponsored && <span className="sponsored">Sponsored</span>}
        <Button href={`./${fm.slug}/`} target="_self">
          Read more →
        </Button>
      </footer>
    </article>
  );
}

function BlogIndex(props: HydrationData) {
  const dataURL = `./index.json`;
  const { data } = useSWR<BlogIndexData>(
    dataURL,
    async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new HTTPError(response.status, url, "Page not found");
        }

        const text = await response.text();
        throw new HTTPError(response.status, url, text);
      }

      return (await response.json()).hyData;
    },
    {
      fallbackData: props.hyData,
      revalidateOnFocus: WRITER_MODE,
      revalidateOnMount: !props.hyData,
    }
  );
  return (
    <>
      <main
        className="blog-container blog-index container main-page-content"
        lang="en-US"
      >
        <header>
          <h1 className="mify">Blog it better</h1>
          <BlogFeedIcon />
        </header>
        <section className="article-list">
          {data?.posts.map((fm) => {
            return <PostPreview key={fm.slug} fm={fm} />;
          })}
        </section>
      </main>
      <NewsletterSignUp />
    </>
  );
}
