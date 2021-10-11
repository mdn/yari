import { useLocale } from "../../../hooks";

import "./index.scss";

export default function SubscribeLink() {
  const locale = useLocale();

  return (
    <a href={`/${locale}/plus`} className="mdn-plus-subscribe-link">
      Get MDN Plus
    </a>
  );
}
