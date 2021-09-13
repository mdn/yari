import { styled } from "linaria/react";

import { useLocale } from "../../../hooks";
import {
  lightModeButtonPrimaryDefault,
  mqTabletAndUp,
} from "../../vars/js/variables";

export default function SubscribeLink() {
  const locale = useLocale();

  const SubscribeLink = styled.a`
    background-color: ${lightModeButtonPrimaryDefault};
    border-radius: 4px;
    display: block;
    margin-top: 8px;
    padding: 8px 16px;
    text-align: center;

    @media ${mqTabletAndUp} {
      margin-top: 0;
    }

    &:link,
    &:visited {
      color: #fff;
    }
  `;

  return <SubscribeLink href={`/${locale}/plus`}>Get MDN Plus</SubscribeLink>;
}
