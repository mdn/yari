import "./index.scss";
import { ReactComponent as Quote } from "./quote.svg";

export function Testimonial() {
  return (
    <div className="testimonial">
      <iframe
        className="testimonal-frame"
        src="https://www.youtube-nocookie.com/embed/gIXw-3H48yU"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <div className="testimonial-copy">
        <Quote />
        <p>
          Condimentum donec quam odio viverra erat mi mae-cenas odio. Tempus
          arcu tincidunt tortor placerat tempor pharetra.
        </p>
        <span className="author-name">
          <b>First Name</b>
        </span>
        <span className="author-title">Title goes here</span>
      </div>
    </div>
  );
}
