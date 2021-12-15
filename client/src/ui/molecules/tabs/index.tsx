import { useLocale } from "../../../hooks";
import { Link } from "react-router-dom";

import Container from "../../atoms/container";

import "./index.scss";

export default function Tabs() {
  const locale = useLocale();

  return (
    <nav className="tabs">
      <Container>
        <ul>
          <li>
            <Link to={`/${locale}/plus/notifications/`} aria-current="page">
              All Notifications
            </Link>
          </li>
          <li>
            <Link to={`/${locale}/plus/notifications/watching`}>
              Watch List
            </Link>
          </li>
          <li>
            <Link to={`/${locale}/plus/notifications/starred`}>Starred</Link>
          </li>
        </ul>
      </Container>
    </nav>
  );
}
