import "./index.scss";
import { Button } from "../button";
import { usePlusUrl } from "../../../plus/utils";
import { useGleanClick } from "../../../telemetry/glean-context";
import { useLoginUrl } from "../login-link";

export const SignUpLink = ({ toPlans = false, gleanContext = "" }) => {
  const gleanClick = useGleanClick();
  const plansUrl = usePlusUrl() + "#subscribe";
  const loginUrl = useLoginUrl();

  const href = toPlans ? plansUrl : loginUrl;
  const label = toPlans ? "Upgrade Now" : "Sign up";
  const rel = toPlans ? undefined : "nofollow";

  return (
    <Button
      href={href}
      target="_self"
      extraClasses="mdn-plus-subscribe-link"
      onClickHandler={() => gleanContext && gleanClick(gleanContext)}
      rel={rel}
    >
      {label}
    </Button>
  );
};
