import "./index.scss";

export function Byline({
  avatar,
  author,
  authorBioURL,
  publishDate,
  readTime,
}: {
  avatar: string;
  author: string;
  authorBioURL: {
    url: string;
    text: string;
  };
  publishDate: string;
  readTime: string;
}) {
  return (
    <div className="byline">
      <div className="author-avatar">
        <img
          src={`/assets/author-avatar/${avatar}`}
          width="50"
          height="50"
          alt={author}
        />
      </div>
      <div className="author-byline">
        <h3 className="author-name">
          <a href={authorBioURL.url} rel="external">
            {authorBioURL.text}
          </a>
        </h3>
        <ul className="article-meta">
          <li>{publishDate}</li>
          <li>{readTime}</li>
        </ul>
      </div>
    </div>
  );
}
