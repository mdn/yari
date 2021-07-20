import "./index.scss";

const Byline = ({ avatar, author, authorDescription }) => {
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
        <p className="author-description">{authorDescription}</p>
      </div>
    </div>
  );
};
export default Byline;
