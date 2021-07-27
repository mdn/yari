import "./index.scss";

export function Byline({
  avatar,
  author,
  authorDescription,
  authorBioURL,
  authorBioURLText,
}: {
  avatar: string;
  author: string;
  authorDescription: string;
  authorBioURL?: string;
  authorBioURLText?: string;
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
        <h3 className="author-name">{author}</h3>
        <p className="author-description">
          {authorDescription}
          {authorBioURL && <a href={authorBioURL}>{authorBioURLText}</a>}
        </p>
      </div>
    </div>
  );
}
