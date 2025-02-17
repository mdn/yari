import { CurriculumIndexEntry } from "../../../libs/types/curriculum";

import "./module.scss";
export function Sidebar({
  current = "",
  extraClasses = "",
  sidebar = [],
}: {
  current: string;
  extraClasses?: string;
  sidebar: CurriculumIndexEntry[];
}) {
  return (
    <aside
      className={`curriculum-sidebar ${extraClasses}`}
      data-current={current}
    >
      <ol>
        {sidebar.map((entry, i) => (
          <li
            className={entry.children && entry.children?.length ? "toggle" : ""}
            key={`sb-${i}`}
          >
            {entry.children && entry.children?.length ? (
              <details
                open={
                  entry.children.some((c) => c.url === current) ||
                  entry.url === current
                }
              >
                <summary>{entry.title}</summary>
                <ol>
                  <li>
                    <SidebarLink
                      current={current}
                      url={entry.url}
                      title={`${entry.title.replace(/ modules$/, "")} overview`}
                    />
                  </li>
                  {entry.children.map((subEntry, j) => {
                    return (
                      <li key={`sb-${i}-${j}`}>
                        <SidebarLink
                          current={current}
                          url={subEntry.url}
                          title={subEntry.title}
                        />
                      </li>
                    );
                  })}
                </ol>
              </details>
            ) : (
              <SidebarLink
                current={current}
                url={entry.url}
                title={entry.title}
              />
            )}
          </li>
        ))}
      </ol>
    </aside>
  );
}

function SidebarLink({
  current,
  url,
  title,
}: {
  current: string;
  url: string;
  title: string;
}) {
  const isCurrent = url === current;
  if (isCurrent) {
    return (
      <em>
        <a href={url} aria-current="page">
          {title}
        </a>
      </em>
    );
  } else {
    return <a href={url}>{title}</a>;
  }
}
