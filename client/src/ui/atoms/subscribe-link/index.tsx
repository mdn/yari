import "./index.scss";
import { Button } from "../button";
import { usePlusUrl } from "../../../plus/utils";

/**
 *
 * @param {boolean} toFXA - Whether this link goes to FXA, ot `/plus`
 * @returns {JSX.Element} - The anchor link with the appropriate URL
 */
export const SubscribeLink = () => {
  const href = usePlusUrl();

  return (
    <Button href={href} extraClasses="mdn-plus-subscribe-link">
      Get MDN Plus
    </Button>
  );
};
