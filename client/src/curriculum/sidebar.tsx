import { ModuleIndexEntry } from "../../../libs/types/curriculum";

import "./module.scss";
export function Sidebar({ sidebar = [] }: { sidebar: ModuleIndexEntry[] }) {
  return (
    <aside className="sidebar">
      <ol>
        {sidebar.map((o, i) => (
          <li key={i}>
            <a href={o.url}>{o.title}</a>
            {o.children && (
              <ol>
                {o.children.map((c, j) => {
                  return (
                    <li key={`${i}-${j}`}>
                      <a href={c.url}>{c.title}</a>
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
