import "./index.scss";
import { Button } from "../button";
import { usePlusUrl } from "../../../plus/utils";
import { useGleanClick } from "../../../telemetry/glean-context";

export const SubscribeLink = ({ toPlans = false, gleanContext = "" }) => {
  const href = usePlusUrl();
  const gleanClick = useGleanClick();
  return (
    <Button
      href={href + (toPlans ? "#subscribe" : "")}
      extraClasses="mdn-plus-subscribe-link"
      onClickHandler={() => gleanContext && gleanClick(gleanContext)}
    >
      {toPlans ? "Upgrade Now" : "Get MDN Plus"}
    </Button>
  );
};
