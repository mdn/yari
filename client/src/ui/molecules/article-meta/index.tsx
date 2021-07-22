import "./index.scss";

export function ArticleMeta({
  publishDate,
  readTime,
}: {
  publishDate: string;
  readTime: string;
}) {
  return (
    <ul className="article-meta">
      <li>{publishDate}</li>
      <li>{readTime}</li>
    </ul>
  );
}
