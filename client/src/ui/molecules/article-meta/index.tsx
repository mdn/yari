import "./index.scss";

const ArticleMeta = ({ publishDate, readTime }) => {
  return (
    <ul className="article-meta">
      <li>{publishDate}</li>
      <li>{readTime}</li>
    </ul>
  );
};

export default ArticleMeta;
