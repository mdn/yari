import { Button } from "../../ui/atoms/button";
import "./index.scss";

export function GetInvolved() {
  return (
    <div className="get-involved">
      <span>
        <h2> Want to be part of the journey?</h2>
        Our constant quest for innovation starts here, with you. Every part of
        MDN (docs, demos and the site itself) springs from our incredible open
        community of developers. Please join us!
        <Button extraClasses="get-involved-cta">Get Involved</Button>
      </span>
    </div>
  );
}
