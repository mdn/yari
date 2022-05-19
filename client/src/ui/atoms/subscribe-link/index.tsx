import "./index.scss";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../button'. Did you mean to se... Remove this comment to see the full error message
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
