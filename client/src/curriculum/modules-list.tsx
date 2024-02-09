import { ModuleIndexEntry } from "../../../libs/types/curriculum";
import { TopicIcon } from "./topic-icon";
import { topic2css } from "./utils";

import "./modules-list.scss";
import { useState } from "react";
import { Button } from "../ui/atoms/button";

export function ModulesListList({ modules }: { modules: ModuleIndexEntry[] }) {
  const [tab, setTab] = useState(1);
  return (
    <ol className="modules-list-list">
      <hr />
      {modules.map((c, i) => {
        return (
          <li key={`mll-${i}`}>
            <input
              className="visually-hidden"
              id={`module-${i}`}
              name="selected"
              type="radio"
              checked={i === tab}
              onChange={() => setTab(i)}
            />
            <label htmlFor={`module-${i}`}>{c.title}</label>
            {c.children && (
              <>
                <ModulesList modules={c.children} />
                <Button type="primary" target="_self" href={c.children[0].url}>
                  Let's begin
                </Button>
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function ModulesList({ modules }: { modules: ModuleIndexEntry[] }) {
  return (
    <ol className="modules-list">
      {modules.map((c, j) => {
        return (
          <li
            key={`ml-${j}`}
            className={`module-list-item topic-${topic2css(c.topic)}`}
          >
            <header>
              <a href={c.url}>
                {c.topic && <TopicIcon topic={c.topic} />}
                <span>{c.title}</span>
              </a>
            </header>
            <section>
              <p>{c.summary}</p>
              <p>{c.topic}</p>
            </section>
          </li>
        );
      })}
    </ol>
  );
}
