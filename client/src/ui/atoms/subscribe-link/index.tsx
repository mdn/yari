import "./index.scss";
import { Button } from "../button";
import { usePlusUrl } from "../../../plus/utils";
import { gleanClick, useGlean } from "../../../telemetry/glean-context";
import { TOP_NAV_GET_MDN_PLUS } from "../../../telemetry/constants";

/**
 *
 * @param {boolean} toFXA - Whether this link goes to FXA, ot `/plus`
 * @returns {JSX.Element} - The anchor link with the appropriate URL
 */
export const SubscribeLink = () => {
  const href = usePlusUrl();
  const glean = useGlean();
  return (
    <Button
      href={href}
      extraClasses="mdn-plus-subscribe-link"
      onClickHandler={() => gleanClick(TOP_NAV_GET_MDN_PLUS, null, glean)}
    >
      Get MDN Plus
    </Button>
  );
};
