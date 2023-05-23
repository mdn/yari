import useSWR from "swr";

import { HTTPError } from "../document";
import { CRUD_MODE } from "../env";

import { Route, Routes } from "react-router-dom";
import { HydrationData } from "../../../libs/types/hydration";
import { BlogPost, AuthorDateReadTime } from "./post";
import { BlogImage, BlogPostFrontmatter } from "../../../libs/types/blog.js";

import "./index.scss";
import "./post.scss";
import { Button } from "../ui/atoms/button";
import { SignUpSection as NewsletterSignUp } from "../newsletter";

interface BlogIndexData {
  posts: BlogPostFrontmatter[];
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

function PostPreview({ fm }: { fm: BlogPostFrontmatter }) {
  return (
    <article>
      <header>
        <BlogIndexImageFigure image={fm.image} height={200} slug={fm.slug} />
        {fm.sponsored && <span className="sponsored">Sponsored</span>}
        <h2>
          <a href={`./${fm.slug}/`}>{fm.title}</a>
        </h2>
        <AuthorDateReadTime metadata={fm} />
      </header>
      <p>{fm.description}</p>
      <Button href={`./${fm.slug}/`} target="_self">
        Read more →
      </Button>
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
      revalidateOnFocus: CRUD_MODE,
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
        </header>
        {data?.posts.map((fm) => {
          return <PostPreview key={fm.slug} fm={fm} />;
        })}
      </main>
      <NewsletterSignUp />
    </>
  );
}
