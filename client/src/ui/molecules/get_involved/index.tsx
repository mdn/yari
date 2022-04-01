import { useLocale } from "../../../hooks";
import "./index.scss";

export function GetInvolved() {
  const locale = useLocale();
  return (
    <div className="get-involved dark">
      <section>
        <h2> Want to be part of the journey?</h2>
        <p>
          Our constant quest for innovation starts here, with you. Every part of
          MDN (docs, demos and the site itself) springs from our incredible open
          community of developers. Please join us!
          <a className="get-involved-cta" href={`/${locale}/community/`}>
            Get Involved →
          </a>
        </p>
      </section>
    </div>
  );
}
