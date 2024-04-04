import { Link, useSearchParams } from "react-router-dom";
import { range } from "../../../utils";

const PARAM = "page";

function PageLink({
  page,
  children,
  onClick,
  disabled,
}: {
  page: number;
  children?: React.ReactNode;
  onClick?: (page: number) => unknown;
  disabled?: boolean;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Link
      to={{}}
      className={disabled ? "disabled" : ""}
      onClick={(event) => {
        event.preventDefault();
        if (disabled) {
          return;
        }

        onClick && onClick(page);
        setSearchParams({
          ...Object.fromEntries(searchParams.entries()),
          [PARAM]: page.toString(),
        });

        window.setTimeout(() => document.documentElement.scrollTo());
      }}
    >
      {children || page}
    </Link>
  );
}

export function Paginator({
  first = 1,
  last,
  endPadding = 2,
  middlePadding = 2,
  onChange,
}: {
  first?: number;
  last: number;
  endPadding?: number;
  middlePadding?: number;
  onChange?: (page: number, oldPage: number) => unknown;
}) {
  const [searchParams] = useSearchParams();
  const current = parseInt(searchParams.get(PARAM) || "", 10) || first;
  const middleFirst = Math.max(current - middlePadding, first);
  const middleLast = Math.min(middleFirst + middlePadding * 2 + 1, last + 1);
  const left = range(first, Math.min(endPadding, middleFirst));
  const middle = range(middleFirst, middleLast);
  const right = range(Math.max(last + 1 - endPadding, middleLast), last + 1);

  const onClick = (page: number) => {
    onChange && onChange(page, current);
  };

  if (first === last) {
    // There are no pages, so return nothing
    return <></>;
  }

  return (
    <div className="pagination">
      <PageLink
        page={current - 1}
        onClick={onClick}
        disabled={current === first}
      >
        ← Previous
      </PageLink>
      {left.map((page) => (
        <PageLink key={page} page={page} onClick={onClick} />
      ))}
      {Boolean(left.length) && left[left.length - 1] + 1 !== middle[0] && "…"}
      {middle.map((page) =>
        current === page ? (
          <span className="current-page" key={page}>
            {page}
          </span>
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
      <PageLink
        page={current + 1}
        onClick={onClick}
        disabled={current === last}
      >
        Next →
      </PageLink>
    </div>
  );
}
