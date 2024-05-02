import { CurriculumIndexEntry } from "../../../libs/types/curriculum";
import { TopicIcon } from "./topic-icon";
import { topic2css } from "./utils";

import "./modules-list.scss";
import { useState } from "react";
import { Button } from "../ui/atoms/button";

export function ModulesListList({
  modules,
}: {
  modules: CurriculumIndexEntry[];
}) {
  const [tab, setTab] = useState(1);
  return (
    <ol className="modules-list-list">
      {modules.map((modulesList, i) => {
        return (
          <li
            id={`modules-${i}`}
            className="modules-list-list-item"
            key={`mll-${i}`}
          >
            <input
              className="visually-hidden"
              id={`module-${i}`}
              name="selected"
              type="radio"
              checked={i === tab}
              onChange={() => setTab(i)}
            />
            <label htmlFor={`module-${i}`}>
              {modulesList.title.replace(/ modules$/, "")}
            </label>
            {modulesList.children?.length && (
              <>
                <ModulesList modules={modulesList.children} />
                <Button
                  extraClasses={"lets-begin"}
                  type="primary"
                  target="_self"
                  href={modulesList.children[0]?.url}
                >
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

export function ModulesList({ modules }: { modules: CurriculumIndexEntry[] }) {
  return (
    <ol className="modules-list">
      {modules.map((module, j) => {
        return (
          <li
            key={`ml-${j}`}
            className={`module-list-item topic-${topic2css(module.topic)}`}
          >
            <a href={module.url}>
              <header>
                {module.topic && <TopicIcon topic={module.topic} />}
                <span>{module.title}</span>
              </header>
              <section>
                <p>{module.summary}</p>
                <p>{module.topic}</p>
              </section>
            </a>
          </li>
        );
      })}
    </ol>
  );
}
