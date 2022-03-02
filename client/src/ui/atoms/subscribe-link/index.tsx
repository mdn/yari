import { useLocale } from "../../../hooks";

import "./index.scss";
import { Button } from "../button";

/**
 *
 * @param {boolean} toFXA - Whether this link goes to FXA, ot `/plus`
 * @returns {JSX.Element} - The anchor link with the appropriate URL
 */
export const SubscribeLink = () => {
  const locale = useLocale();
  const endPoint = `/${locale}/plus`;

  return (
    <Button href={endPoint} extraClasses="mdn-plus-subscribe-link">
      Get MDN Plus
    </Button>
  );
};
