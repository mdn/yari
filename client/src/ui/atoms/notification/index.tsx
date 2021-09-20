import { styled } from "linaria/react";

import {
  fullColorRampBlackWhiteWhite,
  fullColorRampViolet70,
} from "../../vars/js/variables.js";

export default function Notification({ children }) {
  const Notification = styled.div`
    background-color: ${fullColorRampViolet70};
    color: ${fullColorRampBlackWhiteWhite};
    padding: 12px;
    text-align: center;

    p {
      margin-bottom: 0;
    }
  `;

  return <Notification>{children}</Notification>;
}
