import { DisplayH2, DisplayH3 } from "./ingredients/utils";

export function SpecificationTable({
  id,
  title,
  isH3,
  specURLs,
}: {
  id: string;
  title: string;
  isH3: boolean;
  specURLs: string[];
}) {
  return (
    <>
      {title && !isH3 && <DisplayH2 id={id} title={title} />}
      {title && isH3 && <DisplayH3 id={id} title={title} />}
      <table className="standard-table">
        <thead>
          <tr>
            <th scope="col">Specification</th>
          </tr>
        </thead>
        <tr>
          <td>{specURLs}</td>
        </tr>
      </table>
    </>
  );
}
