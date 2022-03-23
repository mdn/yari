import { useParams } from "react-router-dom";
import StaticPage from "../../homepage/static-page";
import { Button } from "../../ui/atoms/button";

function StaticPlusPage({ slug, ...props }) {
  const { locale } = useParams();

  return (
    <StaticPage
      {...{
        locale,
        slug: `plus/${slug}`,
        title: "MDN Plus",
        sidebarHeader: (
          <Button href={`/${locale}/plus`}>← Back to Overview</Button>
        ),
        initialData: props.hyData ? props : undefined,
      }}
    />
  );
}

export default StaticPlusPage;
