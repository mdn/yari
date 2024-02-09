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
          <li key={`sb-${i}`}>
            <SidebarLink current={current} url={o.url} title={o.title} />
            {o.children && (
              <ol>
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
