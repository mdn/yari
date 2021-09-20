import { styled } from "linaria/react";

import {
  fullColorRampLightGrey60,
  lightModeBorderSecondary,
  lightModeTextSecondary,
} from "../../vars/js/variables.js";

export function AuthDisabled() {
  const Notecard = styled.div`
    border: 1px solid ${lightModeBorderSecondary};
    border-radius: 4px;
    box-shadow: 0 0 7px 1px ${fullColorRampLightGrey60},
      0 0 0 2px ${fullColorRampLightGrey60};
    color: ${lightModeTextSecondary};
    padding: 16px;

    p {
      margin-bottom: 0;
    }
  `;

  return (
    <Notecard>
      <p>
        <strong>Authentication disabled: </strong>Authentication and the user
        settings app is currently disabled.
      </p>
    </Notecard>
  );
}
