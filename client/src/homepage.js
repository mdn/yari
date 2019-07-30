import React from "react";
import { Link } from "@reach/router";

export class Homepage extends React.Component {
  render() {
    return (
      <div>
        <h2>Welcome to MDN</h2>
        <ul>
          <li>
            <Link to="/docs/Web/HTML/Element/audio">HTML/audio</Link>
          </li>
          <li>
            <Link to="/docs/Web/HTML/Element/video">HTML/video</Link>
          </li>
          <li>
            <Link to="/docs/Web/HTML/Element/canvas">HTML/canvas</Link>
          </li>
        </ul>
      </div>
    );
  }
}
