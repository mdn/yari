import { Link } from "react-router-dom";
import { range } from "../../../utils";

function PageLink({
  page,
  children,
}: {
  page: number;
  children?: React.ReactNode;
}) {
  return <Link to={`?page=${page}`}>{children || page}</Link>;
}

export function Paginator({
  current,
  last,
  endPadding = 2,
  middlePadding = 2,
}: {
  current: number;
  last: number;
  endPadding?: number;
  middlePadding?: number;
}) {
  const middleFirst = Math.max(current - middlePadding, 0);
  const middleLast = Math.min(middleFirst + middlePadding * 2 + 1, last + 1);
  const left = range(0, Math.min(endPadding, middleFirst));
  const middle = range(middleFirst, middleLast);
  const right = range(Math.max(last + 1 - endPadding, middleLast), last + 1);

  return (
    <div className="pagination">
      {current > 0 && <PageLink page={current - 1}>{"<"} Previous</PageLink>}
      {left.map((page) => (
        <PageLink key={page} page={page} />
      ))}
      {Boolean(left.length) && left[left.length - 1] + 1 !== middle[0] && "…"}
      {middle.map((page) =>
        current === page ? (
          <span key={page}>{page}</span>
        ) : (
          <PageLink key={page} page={page} />
        )
      )}
      {Boolean(right.length) &&
        middle[middle.length - 1] + 1 !== right[0] &&
        "…"}
      {right.map((page) => (
        <PageLink key={page} page={page} />
      ))}
      {current < last && <PageLink page={current + 1}>Next {">"}</PageLink>}
    </div>
  );
}
