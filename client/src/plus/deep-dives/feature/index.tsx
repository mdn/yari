import "./index.scss";

export function Feature() {
  return (
    <div className="deep-dives-feature-wrapper">
      <div className="girdle">
        <div className="heading-group">
          <h1>
            Boost your learning <span>with MDN Deep Dives</span>
          </h1>
          <h2 className="gradient-clip-text">Coming up next</h2>
        </div>
        <p>
          Receive access to new deep dives every month, written by Mozilla and
          industry insiders. Upcoming titles include:
        </p>
        <ul>
          <li>Modern CSS in the Real World</li>
          <li>A robust CSS pattern library</li>
          <li>Modern responsive web design</li>
          <li>Security considerations in web development</li>
          <li>
            GDPR, DSAR, CCPA, and COPPA. So many acronyms! Learn Mozilla's
            framework to handle privacy laws
          </li>
        </ul>
      </div>
    </div>
  );
}
