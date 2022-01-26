import { Button } from "../../ui/atoms/button";
import "./index.scss";
const contributorGraphic = `${
  process.env.PUBLIC_URL || ""
}/assets/tiled-dinos.svg`;

export function ContributorSpotlight() {
  return (
    <div className="contributor-spotlight">
      <div className="wrapper">
        <span>
          <h2 className="mdn-ui-emphasis-l">Contributor Spotlight</h2>
          <span className="contributor-name">@username</span>
          <p>
            Lectus vitae senectus proin vel leo. Venenatis volutpat consequat
            laoreet amet sed sollicitudin.
          </p>
          <Button href="/contribute" extraClasses="spotlight-cta">
            Get involved
          </Button>
        </span>
        <figure className="contributor-graphic">
          <img src={contributorGraphic} alt="Tiled Mozilla Logo" />
        </figure>
      </div>
    </div>
  );
}
