import { DisplayH2, DisplayH3 } from "./utils";
import NoteCard from "../../ui/molecules/notecards";

export function SpecificationSection({
  id,
  title,
  isH3,
  specifications,
  query,
}: {
  id: string;
  title: string;
  isH3: boolean;
  specifications: Array<{
    title: string;
    bcdSpecificationURL: string;
  }>;
  query: string;
}) {
  return (
    <>
      {title && !isH3 && <DisplayH2 id={id} title={title} />}
      {title && isH3 && <DisplayH3 id={id} title={title} />}

      {/*
        If we were to output HTML table markup here, then in the case where
        we have multiple BCD features from a browser-compat frontmatter
        key, we’d end up with multiple tables in the output. So we instead
        output a simpler HTML structure for each specification, and use CSS
        to push each piece together to make the collective end result look
        like a table; client/src/document/index.scss has the CSS styles.
      */}
      <div className="spec-header">Specification</div>
      {specifications.length > 0 ? (
        <div className="specs">
          {specifications.map((spec) => (
            <p key={spec.bcdSpecificationURL}>
              <a href={spec.bcdSpecificationURL}>
                {spec.title} <br />
                {spec.bcdSpecificationURL.includes("#") && (
                  <small># {`${spec.bcdSpecificationURL.split("#")[1]}`}</small>
                )}
              </a>
            </p>
          ))}
        </div>
      ) : (
        <NoteCard type="warning">
          <h4>No specification found</h4>
          <p>
            No specification data found for <code>{query}</code>.<br />
            <a href="#on-github">Check for problems with this page</a> or
            contribute a missing <code>spec_url</code> to{" "}
            <a href="https://github.com/mdn/browser-compat-data">
              mdn/browser-compat-data
            </a>
            . Also make sure the specification is included in{" "}
            <a href="https://github.com/w3c/browser-specs">w3c/browser-specs</a>
            .
          </p>
        </NoteCard>
      )}
    </>
  );
}
