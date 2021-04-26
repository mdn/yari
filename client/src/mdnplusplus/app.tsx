import "./index.scss";

export default function App({ ...appProps }) {
  return (
    <div className="mdnplusplus">
      {/* From https://app.alchemer.com/distribute/share/id/6295937 */}
      <iframe
        src="https://survey.alchemer.com/s3/6295937/MDN-Fake-Door-Survey"
        title="MDN++ survey"
        frameBorder="0"
        width="700"
        height="500"
        style={{ overflow: "hidden" }}
      ></iframe>
    </div>
  );
}
