import { useParams } from "react-router-dom";
import { MDN_PLUS_TITLE } from "../../constants";
import StaticPage from "../../homepage/static-page";
import { Button } from "../../ui/atoms/button";

function PlusDocs({ ...props }) {
  const { locale, "*": slug } = useParams();

  return (
    <StaticPage
      {...{
        locale,
        slug: `plus/docs/${slug}`,
        title: MDN_PLUS_TITLE,
        sidebarHeader: (
          <Button href={`/${locale}/plus`}>← Back to Overview</Button>
        ),
        initialData: props.hyData ? props : undefined,
      }}
    />
  );
}

export default PlusDocs;
