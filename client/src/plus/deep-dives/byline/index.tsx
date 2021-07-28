import "./index.scss";

export function Byline({
  avatar,
  author,
  authorDescription,
  authorBioURLS,
  authorBioURLSText,
}: {
  avatar: string;
  author: string;
  authorDescription: string;
  authorBioURLS?: Array<string>;
  authorBioURLSText?: Array<string>;
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

        {authorBioURLS && (
          <ul className="author-links">
            {authorBioURLS.map((url, index) => {
              return (
                <li>
                  <a href={url} rel="external">
                    {authorBioURLSText && authorBioURLSText[index]}
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
