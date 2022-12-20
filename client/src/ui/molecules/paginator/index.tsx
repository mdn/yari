import { Link } from "react-router-dom";
import { range } from "../../../utils";

function PageLink({
  page,
  children,
  onClick,
}: {
  page: number;
  children?: React.ReactNode;
  onClick?: (page: number) => unknown;
}) {
  return (
    <Link to={`?page=${page}`} onClick={() => onClick && onClick(page)}>
      {children || page}
    </Link>
  );
}

export function Paginator({
  first = 0,
  current,
  last,
  endPadding = 2,
  middlePadding = 2,
  onChange,
}: {
  first?: number;
  current: number;
  last: number;
  endPadding?: number;
  middlePadding?: number;
  onChange?: (page: number, oldPage: number) => unknown;
}) {
  const middleFirst = Math.max(current - middlePadding, first);
  const middleLast = Math.min(middleFirst + middlePadding * 2 + 1, last + 1);
  const left = range(first, Math.min(endPadding, middleFirst));
  const middle = range(middleFirst, middleLast);
  const right = range(Math.max(last + 1 - endPadding, middleLast), last + 1);

  const onClick = (page: number) => onChange && onChange(page, current);

  return (
    <div className="pagination">
      {current > first && (
        <PageLink page={current - 1} onClick={onClick}>
          {"<"} Previous
        </PageLink>
      )}
      {left.map((page) => (
        <PageLink key={page} page={page} onClick={onClick} />
      ))}
      {Boolean(left.length) && left[left.length - 1] + 1 !== middle[0] && "…"}
      {middle.map((page) =>
        current === page ? (
          <span key={page}>{page}</span>
        ) : (
          <PageLink key={page} page={page} onClick={onClick} />
        )
      )}
      {Boolean(right.length) &&
        middle[middle.length - 1] + 1 !== right[0] &&
        "…"}
      {right.map((page) => (
        <PageLink key={page} page={page} onClick={onClick} />
      ))}
      {current < last && (
        <PageLink page={current + 1} onClick={onClick}>
          Next {">"}
        </PageLink>
      )}
    </div>
  );
}
