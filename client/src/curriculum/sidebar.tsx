import { ModuleIndexEntry } from "../../../libs/types/curriculum";

import "./module.scss";
export function Sidebar({
  current = "",
  extraClasses = "",
  sidebar = [],
}: {
  current: string;
  extraClasses?: string;
  sidebar: ModuleIndexEntry[];
}) {
  return (
    <aside
      className={`curriculum-sidebar ${extraClasses}`}
      data-current={current}
    >
      <ol>
        {sidebar.map((o, i) => (
          <li
            className={o.children && o.children?.length ? "toggle" : ""}
            key={`sb-${i}`}
          >
            {o.children && o.children?.length ? (
              <details
                open={
                  o.children.some((c) => c.url === current) || o.url === current
                }
              >
                <summary>{o.title}</summary>
                <ol>
                  <li>
                    <SidebarLink
                      current={current}
                      url={o.url}
                      title={o.title}
                    />
                  </li>
                  {o.children.map((c, j) => {
                    return (
                      <li key={`sb-${i}-${j}`}>
                        <SidebarLink
                          current={current}
                          url={c.url}
                          title={c.title}
                        />
                      </li>
                    );
                  })}
                </ol>
              </details>
            ) : (
              <SidebarLink current={current} url={o.url} title={o.title} />
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
