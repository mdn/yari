import { Link, useLocation } from "react-router-dom";

import Container from "../../atoms/container";

import "./index.scss";

type TabItem = {
  component?: () => JSX.Element;
  extraClasses?: string | null;
  label: string;
  path: string;
};

export default function Tabs({ tabs }: { tabs: TabItem[] }) {
  const location = useLocation();

  return (
    <nav className="tabs">
      <Container>
        <ul>
          {tabs.map((tab: TabItem, index) => {
            const currentCheck = location.pathname === tab.path;

            return (
              <li className="tab" key={`tab-${index}`}>
                <Link
                  to={tab.path}
                  aria-current={currentCheck}
                  className="tab-item"
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}
