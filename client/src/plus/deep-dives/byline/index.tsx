import "./index.scss";

export function Byline({
  avatar,
  author,
  authorDescription,
  authorBioURLs,
}: {
  avatar: string;
  author: string;
  authorDescription: string;
  authorBioURLs?: Array<{
    url: string;
    text: string;
  }>;
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
        <h3 className="author-name">{`${author}, ${authorDescription}`}</h3>

        {authorBioURLs && authorBioURLs.length > 0 && (
          <ul className="author-links">
            {authorBioURLs.map(({ url, text }) => {
              return (
                <li key={url}>
                  <a href={url} rel="external">
                    {text}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
