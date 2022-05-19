import { Link, LinkProps } from "react-router-dom";

/**
 * Returns a Link, or an anchor, if it targets a hash.
 */
export default function InternalLink(props: LinkProps) {
  const href = props.to;

  if (typeof href === "string" && href.includes("#")) {
    return (
      <a href={href} {...props}>
        {props.children}
      </a>
    );
  }

  return <Link {...props}>{props.children}</Link>;
}
