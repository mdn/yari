import { ModuleIndexEntry } from "../../../libs/types/curriculum";

export function ModulesListList({ modules }: { modules: ModuleIndexEntry[] }) {
  return (
    <ol>
      {modules.map((c, i) => {
        return (
          <li>
            <label htmlFor={`module-${i}`}>{c.title}</label>
            <input id={`module-${i}`} name="selected" type="radio" />
            {c.children && <ModulesList modules={c.children} />}
          </li>
        );
      })}
    </ol>
  );
}

export function ModulesList({ modules }: { modules: ModuleIndexEntry[] }) {
  return (
    <ol>
      {modules.map((c, j) => {
        return (
          <li key={j}>
            <a href={c.url}>{c.title}</a>
            <p>{c.summary}</p>
            <p>{c.topic}</p>
          </li>
        );
      })}
    </ol>
  );
}
