import { useLocation } from "react-router-dom";
import { styled } from "linaria/react";

import { useLocale } from "../../../hooks";

import { mqTabletAndUp, mqLargeDesktopAndUp } from "../../vars/js/variables";

export function Logo({ mode }: { mode?: string }) {
  const locale = useLocale();
  const location = useLocation();

  let DocsHeaderLogo = styled.a`
    background: transparent url("../../../assets/mdn-docs-logo.svg") center
      center no-repeat;
    background-size: 170px auto;
    display: block;
    height: 55px;
    width: 170px;

    @media ${mqTabletAndUp} {
      background-size: 200px auto;
      height: 65px;
      width: 200px;
    }

    @media ${mqLargeDesktopAndUp} {
      background-size: contain;
      flex-basis: 200px;
    }
  `;

  const PlusHeaderLogo = styled(DocsHeaderLogo)`
    background-image: url("../../../assets/mdn-plus-logo.svg");
  `;

  const Logo =
    location.pathname.indexOf("/plus") > -1 ? PlusHeaderLogo : DocsHeaderLogo;

  return (
    <Logo href={`/${locale}/`}>
      <span className="visually-hidden">MDN Web Docs</span>
    </Logo>
  );
}
