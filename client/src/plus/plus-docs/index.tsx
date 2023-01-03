import { useParams } from "react-router-dom";
import { MDN_PLUS_TITLE } from "../../constants";
import StaticPage from "../../homepage/static-page";
import "./index.scss";

function PlusDocs({ ...props }) {
  const { locale = "en-US", "*": slug } = useParams();

  return (
    <StaticPage
      {...{
        extraClasses: "plus-docs",
        locale,
        slug: `plus/docs/${slug}`,
        title: MDN_PLUS_TITLE,
        parents: [{ uri: `/${locale}/plus`, title: MDN_PLUS_TITLE }],
        fallbackData: props.hyData ? props : undefined,
      }}
    />
  );
}

export default PlusDocs;
