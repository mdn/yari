import { PLUS_UPDATES } from "../../telemetry/constants";
import { PlusLoginBanner } from "../common/login-banner";

export function LoginBanner() {
  return (
    <PlusLoginBanner gleanPrefix={PLUS_UPDATES.MDN_PLUS}>
      Want to use filters?
    </PlusLoginBanner>
  );
}
