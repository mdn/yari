import useSWR from "swr";

import { HydrationData } from "../../../libs/types/hydration";
import { HTTPError, RenderDocumentBody } from "../document";
import { CRUD_MODE } from "../env";

import "./index.scss";
import "./post.scss";
import {
  BlogImage,
  BlogPostData,
  BlogPostFrontmatter,
  BlogPostLimitedFrontmatter,
} from "../../../libs/types/blog";
import { useCopyExamplesToClipboard } from "../document/hooks";

function MaybeLink({ link, children }) {
  return link ? (
    link.startsWith("https://") ? (
      <a href={link} className="external" target="_blank" rel="noreferrer">
        {children}
      </a>
    ) : (
      <a href={link}>{children}</a>
    )
  ) : (
    <>{children}</>
  );
}

export function TimeToRead({ readTime }: { readTime: number | undefined }) {
  if (!readTime) {
    return <></>;
  }
  return <span className="read-time">{readTime} minute read</span>;
}

export function PublishDate({ date }: { date: string }) {
  return (
    <time className="date" suppressHydrationWarning>
      {Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(
        new Date(date)
      )}
    </time>
  );
}

export function Author({ metadata }: { metadata: BlogPostFrontmatter }) {
  return (
    <MaybeLink link={metadata?.author?.link}>
      <span className="author">{metadata?.author?.name || "The MDN Team"}</span>
    </MaybeLink>
  );
}

export function AuthorDateReadTime({
  metadata,
}: {
  metadata: BlogPostFrontmatter;
}) {
  return (
    <span className="date-author">
      <Author metadata={metadata} />
      <br />
      <PublishDate date={metadata.date} />{" "}
      <TimeToRead readTime={metadata.readTime} />
    </span>
  );
}

function BlogImageFigure({
  image,
  width,
  height,
}: {
  image: BlogImage;
  width?: number;
  height?: number;
}) {
  const src = `./${image.file}`;
  return (
    <figure className="blog-image">
      <img alt={image.alt || ""} src={src} height={height} width={width} />
      {(image.creator || image.source) && (
        <figcaption>
          Image{" "}
          {image.creator && (
            <>
              by{" "}
              <MaybeLink link={image.creator.link}>
                {image.creator.name}
              </MaybeLink>
            </>
          )}
          {image.source && (
            <>
              {" "}
              via{" "}
              <MaybeLink link={image.source.link}>
                {image.source.name}
              </MaybeLink>
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}

function PreviousNext({
  metadata: { previous, next },
}: {
  metadata: BlogPostFrontmatter;
}) {
  return (
    <section className="previous-next">
      {previous && (
        <PreviousNextLink direction="Previous" metadata={previous} />
      )}
      {next && <PreviousNextLink direction="Next" metadata={next} />}
    </section>
  );
}

function PreviousNextLink({
  direction,
  metadata: { slug, title },
}: {
  direction: string;
  metadata: BlogPostLimitedFrontmatter;
}) {
  return (
    <a href={`/en-US/blog/${slug}/`} className={direction.toLowerCase()}>
      <article>
        <h1>
          <strong>{direction} Post</strong> {title}
        </h1>
      </article>
    </a>
  );
}

export function BlogPost(props: HydrationData) {
  const dataURL = `./index.json`;
  const { data } = useSWR<BlogPostData>(
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

      return await response.json();
    },
    {
      fallbackData: props as BlogPostData,
      revalidateOnFocus: CRUD_MODE,
      revalidateOnMount: !props.blogMeta,
    }
  );
  const { doc, blogMeta } = data || props || {};
  useCopyExamplesToClipboard(doc);
  return (
    <>
      {doc && blogMeta && (
        <article
          className="blog-container post container main-page-content"
          lang={doc?.locale}
        >
          <BlogImageFigure image={blogMeta?.image} width={800} height={420} />
          {blogMeta?.sponsored && <span className="sponsored">Sponsored</span>}
          <h1>{doc?.title}</h1>
          <AuthorDateReadTime metadata={blogMeta} />
          <RenderDocumentBody doc={doc} />
          <PreviousNext metadata={blogMeta} />
        </article>
      )}
    </>
  );
}
